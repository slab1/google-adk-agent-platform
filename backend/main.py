"""
Google ADK Agent Development Platform - Backend API
Supports local and API MiniMax-M2 models plus custom models
"""

import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager
from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import structlog
import psutil

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Model Integration Imports
try:
    import litellm
    from litellm import completion, acompletion
    LITE_LLM_AVAILABLE = True
except ImportError:
    LITE_LLM_AVAILABLE = False
    logger.warning("LiteLLM not available - some model integrations may not work")

try:
    import vllm
    VLLM_AVAILABLE = True
except ImportError:
    VLLM_AVAILABLE = False
    logger.warning("vLLM not available - local MiniMax-M2 deployment not supported")

# Configuration Models
@dataclass
class ModelConfig:
    """Configuration for different model types"""
    name: str
    type: str  # "local", "api", "custom"
    provider: str  # "minimax", "openai", "anthropic", etc.
    model_id: str
    api_base: Optional[str] = None
    api_key: Optional[str] = None
    parameters: Dict[str, Any] = None
    capabilities: List[str] = None
    status: str = "inactive"  # "active", "inactive", "error"
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {
                "temperature": 1.0,
                "top_p": 0.95,
                "max_tokens": 2048
            }
        if self.capabilities is None:
            self.capabilities = ["chat", "completion"]

@dataclass
class AgentConfig:
    """Configuration for ADK agents"""
    id: str
    name: str
    description: str
    model_config: ModelConfig
    system_prompt: str
    tools: List[str]
    max_iterations: int = 5
    temperature: float = 1.0
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

# Pydantic Models for API
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    model_override: Optional[str] = None
    stream: bool = True

class AgentCreateRequest(BaseModel):
    name: str
    description: str
    model_config: Dict[str, Any]
    system_prompt: str
    tools: List[str] = []

class ModelTestRequest(BaseModel):
    model_config: Dict[str, Any]
    test_prompt: str

# Model Manager
class ModelManager:
    """Manages different model types and configurations"""
    
    def __init__(self):
        self.model_configs: Dict[str, ModelConfig] = {}
        self.active_sessions: Dict[str, Dict] = {}
        self.performance_metrics: Dict[str, Dict] = {}
        
    def add_model_config(self, config: ModelConfig) -> bool:
        """Add or update model configuration"""
        try:
            self.model_configs[config.name] = config
            logger.info(f"Added model config: {config.name}", 
                       model_type=config.type, provider=config.provider)
            return True
        except Exception as e:
            logger.error(f"Failed to add model config {config.name}: {e}")
            return False
    
    def get_model_config(self, name: str) -> Optional[ModelConfig]:
        """Get model configuration by name"""
        return self.model_configs.get(name)
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all available model configurations"""
        return [asdict(config) for config in self.model_configs.values()]
    
    async def test_model(self, config: ModelConfig, test_prompt: str) -> Dict[str, Any]:
        """Test a model configuration"""
        start_time = datetime.now()
        
        try:
            if config.type == "local" and LITE_LLM_AVAILABLE:
                # Test local model via LiteLLM
                response = await self._test_local_model(config, test_prompt)
            elif config.type == "api":
                # Test API model
                response = await self._test_api_model(config, test_prompt)
            else:
                raise ValueError(f"Unsupported model type: {config.type}")
            
            end_time = datetime.now()
            latency = (end_time - start_time).total_seconds()
            
            # Update performance metrics
            if config.name not in self.performance_metrics:
                self.performance_metrics[config.name] = {
                    "total_requests": 0,
                    "total_latency": 0.0,
                    "success_count": 0,
                    "error_count": 0
                }
            
            metrics = self.performance_metrics[config.name]
            metrics["total_requests"] += 1
            metrics["total_latency"] += latency
            metrics["success_count"] += 1
            
            return {
                "success": True,
                "response": response,
                "latency": latency,
                "model_name": config.name
            }
            
        except Exception as e:
            logger.error(f"Model test failed for {config.name}: {e}")
            if config.name in self.performance_metrics:
                self.performance_metrics[config.name]["error_count"] += 1
            
            return {
                "success": False,
                "error": str(e),
                "model_name": config.name
            }
    
    async def _test_local_model(self, config: ModelConfig, test_prompt: str) -> str:
        """Test local model via LiteLLM"""
        if not LITE_LLM_AVAILABLE:
            raise ValueError("LiteLLM not available for local model testing")
        
        # Configure LiteLLM for local model
        if config.provider == "vllm":
            # vLLM local deployment
            litellm.api_base = config.api_base or "http://localhost:8000/v1"
            litellm.api_key = config.api_key or "dummy"
            
            response = await litellm.acompletion(
                model="openai/placeholder",  # vLLM uses OpenAI-compatible interface
                messages=[{"role": "user", "content": test_prompt}],
                **config.parameters
            )
            return response.choices[0].message.content
            
        elif config.provider == "ollama":
            # Ollama local deployment
            litellm.api_base = config.api_base or "http://localhost:11434"
            litellm.api_key = "dummy"
            
            response = await litellm.acompletion(
                model=f"ollama_chat/{config.model_id}",
                messages=[{"role": "user", "content": test_prompt}],
                **config.parameters
            )
            return response.choices[0].message.content
        
        else:
            raise ValueError(f"Unsupported local provider: {config.provider}")
    
    async def _test_api_model(self, config: ModelConfig, test_prompt: str) -> str:
        """Test API model"""
        if config.provider == "minimax":
            return await self._test_minimax_api(config, test_prompt)
        elif config.provider == "openai":
            return await self._test_openai_api(config, test_prompt)
        elif config.provider == "anthropic":
            return await self._test_anthropic_api(config, test_prompt)
        else:
            raise ValueError(f"Unsupported API provider: {config.provider}")
    
    async def _test_minimax_api(self, config: ModelConfig, test_prompt: str) -> str:
        """Test MiniMax API"""
        # Placeholder for MiniMax API implementation
        # Would need actual API integration based on MiniMax's documentation
        await asyncio.sleep(0.1)  # Simulate API call
        return f"MiniMax API response to: {test_prompt[:50]}..."
    
    async def _test_openai_api(self, config: ModelConfig, test_prompt: str) -> str:
        """Test OpenAI API"""
        if not LITE_LLM_AVAILABLE:
            raise ValueError("LiteLLM not available for OpenAI API testing")
        
        litellm.api_key = config.api_key
        
        response = await litellm.acompletion(
            model=config.model_id,
            messages=[{"role": "user", "content": test_prompt}],
            **config.parameters
        )
        return response.choices[0].message.content
    
    async def _test_anthropic_api(self, config: ModelConfig, test_prompt: str) -> str:
        """Test Anthropic API"""
        if not LITE_LLM_AVAILABLE:
            raise ValueError("LiteLLM not available for Anthropic API testing")
        
        litellm.api_key = config.api_key
        
        response = await litellm.acompletion(
            model=f"anthropic/{config.model_id}",
            messages=[{"role": "user", "content": test_prompt}],
            **config.parameters
        )
        return response.choices[0].message.content

# Agent Manager
class AgentManager:
    """Manages ADK agents and their interactions"""
    
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.agents: Dict[str, AgentConfig] = {}
        self.active_conversations: Dict[str, List[ChatMessage]] = {}
        
    def create_agent(self, request: AgentCreateRequest) -> AgentConfig:
        """Create a new ADK agent"""
        try:
            # Convert dict to ModelConfig
            model_config_dict = request.model_config
            model_config = ModelConfig(**model_config_dict)
            
            agent_config = AgentConfig(
                id=str(uuid.uuid4()),
                name=request.name,
                description=request.description,
                model_config=model_config,
                system_prompt=request.system_prompt,
                tools=request.tools
            )
            
            self.agents[agent_config.id] = agent_config
            
            logger.info(f"Created agent: {agent_config.name}", 
                       agent_id=agent_config.id, 
                       model=model_config.name)
            
            return agent_config
            
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        return [asdict(agent) for agent in self.agents.values()]
    
    def get_agent(self, agent_id: str) -> Optional[AgentConfig]:
        """Get agent by ID"""
        return self.agents.get(agent_id)
    
    async def chat_with_agent(self, agent_id: str, message: str, stream: bool = True) -> Dict[str, Any]:
        """Chat with an agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Add user message to conversation
        if agent_id not in self.active_conversations:
            self.active_conversations[agent_id] = []
        
        user_message = ChatMessage(role="user", content=message)
        self.active_conversations[agent_id].append(user_message)
        
        # Prepare messages for model
        messages = [
            {"role": "system", "content": agent.system_prompt}
        ]
        
        # Add conversation history
        for msg in self.active_conversations[agent_id][-10:]:  # Keep last 10 messages
            messages.append({"role": msg.role, "content": msg.content})
        
        try:
            # Get model response
            response = await self.model_manager._test_api_model(
                agent.model_config, 
                f"Based on conversation context, respond to: {message}"
            )
            
            # Add assistant response to conversation
            assistant_message = ChatMessage(role="assistant", content=response)
            self.active_conversations[agent_id].append(assistant_message)
            
            return {
                "success": True,
                "response": response,
                "agent_id": agent_id,
                "model_used": agent.model_config.name
            }
            
        except Exception as e:
            logger.error(f"Agent chat failed for {agent_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# Initialize managers
model_manager = ModelManager()
agent_manager = AgentManager(model_manager)

# Pre-configured models
DEFAULT_MODELS = [
    ModelConfig(
        name="minimax-m2-local",
        type="local",
        provider="vllm",
        model_id="minimax-m2",
        api_base="http://localhost:8000/v1",
        parameters={
            "temperature": 1.0,
            "top_p": 0.95,
            "max_tokens": 2048
        },
        capabilities=["chat", "completion", "coding", "agentic"]
    ),
    ModelConfig(
        name="minimax-m2-api",
        type="api",
        provider="minimax",
        model_id="minimax-m2",
        api_key=os.getenv("MINIMAX_API_KEY", "your-api-key-here"),
        parameters={
            "temperature": 1.0,
            "top_p": 0.95,
            "max_tokens": 2048
        },
        capabilities=["chat", "completion", "coding", "agentic"]
    ),
    ModelConfig(
        name="gpt-4o",
        type="api",
        provider="openai",
        model_id="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY", "your-api-key-here"),
        parameters={
            "temperature": 1.0,
            "top_p": 0.95,
            "max_tokens": 2048
        },
        capabilities=["chat", "completion", "vision"]
    ),
    ModelConfig(
        name="claude-3-sonnet",
        type="api",
        provider="anthropic",
        model_id="claude-3-sonnet-20240229",
        api_key=os.getenv("ANTHROPIC_API_KEY", "your-api-key-here"),
        parameters={
            "temperature": 1.0,
            "top_p": 0.95,
            "max_tokens": 2048
        },
        capabilities=["chat", "completion", "analysis"]
    )
]

# Add default models
for model in DEFAULT_MODELS:
    model_manager.add_model_config(model)

# Application lifecycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Google ADK Agent Platform API")
    
    # Initialize any required services
    try:
        # Test model connectivity
        for model in DEFAULT_MODELS:
            if model.type == "local":
                logger.info(f"Checking local model: {model.name}")
                # Could test local model availability here
            elif model.type == "api":
                logger.info(f"Checking API model: {model.name}")
                # Could test API connectivity here
        
        logger.info("API startup complete")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Google ADK Agent Platform API")

# FastAPI application
app = FastAPI(
    title="Google ADK Agent Platform",
    description="AI Agent Development Platform with MiniMax-M2 and Custom Models",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Google ADK Agent Platform API",
        "version": "1.0.0",
        "status": "running",
        "models_available": len(model_manager.model_configs),
        "agents_created": len(agent_manager.agents)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        },
        "services": {
            "litellm_available": LITE_LLM_AVAILABLE,
            "vllm_available": VLLM_AVAILABLE,
            "models_loaded": len(model_manager.model_configs)
        }
    }

# Model Management Routes
@app.get("/models")
async def list_models():
    """List all available models"""
    return {
        "models": model_manager.list_models(),
        "total": len(model_manager.model_configs)
    }

@app.post("/models/test")
async def test_model(request: ModelTestRequest):
    """Test a model configuration"""
    try:
        config = ModelConfig(**request.model_config)
        result = await model_manager.test_model(config, request.test_prompt)
        return result
    except Exception as e:
        logger.error(f"Model test failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Agent Management Routes
@app.get("/agents")
async def list_agents():
    """List all agents"""
    return {
        "agents": agent_manager.list_agents(),
        "total": len(agent_manager.agents)
    }

@app.post("/agents")
async def create_agent(request: AgentCreateRequest):
    """Create a new agent"""
    agent = agent_manager.create_agent(request)
    return {
        "agent": asdict(agent),
        "message": f"Agent '{agent.name}' created successfully"
    }

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get agent details"""
    agent = agent_manager.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return asdict(agent)

# Chat Routes
@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Chat with an agent"""
    result = await agent_manager.chat_with_agent(
        agent_id=request.agent_id,
        message=request.message,
        stream=request.stream
    )
    return result

# WebSocket for real-time chat
@app.websocket("/ws/chat/{agent_id}")
async def websocket_chat(websocket: WebSocket, agent_id: str):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    try:
        agent = agent_manager.get_agent(agent_id)
        if not agent:
            await websocket.send_json({
                "type": "error",
                "message": "Agent not found"
            })
            await websocket.close()
            return
        
        # Initialize conversation for this session
        session_id = str(uuid.uuid4())
        agent_manager.active_conversations[f"{agent_id}_{session_id}"] = []
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message = data.get("message", "")
            
            if not message:
                continue
            
            # Send typing indicator
            await websocket.send_json({
                "type": "typing",
                "message": f"{agent.name} is thinking..."
            })
            
            # Process with agent
            try:
                result = await agent_manager.chat_with_agent(
                    agent_id=agent_id,
                    message=message,
                    stream=False
                )
                
                # Send response
                await websocket.send_json({
                    "type": "response",
                    "message": result["response"],
                    "model": result["model_used"],
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Error processing request: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for agent {agent_id}")
    except Exception as e:
        logger.error(f"WebSocket error for agent {agent_id}: {e}")
        await websocket.close()

# Performance monitoring
@app.get("/metrics")
async def get_metrics():
    """Get performance metrics"""
    return {
        "models": model_manager.performance_metrics,
        "agents": {
            "total": len(agent_manager.agents),
            "active_conversations": len(agent_manager.active_conversations)
        },
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )