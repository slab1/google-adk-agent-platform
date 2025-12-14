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

# Workflow Management
@dataclass
class WorkflowConfig:
    """Configuration for ADK workflows"""
    id: str
    name: str
    description: str
    status: str = "draft"  # "draft", "active", "paused", "error"
    created_at: datetime = None
    updated_at: datetime = None
    nodes: List[WorkflowNode] = None
    connections: List[WorkflowConnection] = None
    execution_history: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
        if self.nodes is None:
            self.nodes = []
        if self.connections is None:
            self.connections = []
        if self.execution_history is None:
            self.execution_history = []

class WorkflowManager:
    """Manages ADK workflow configurations and executions"""
    
    def __init__(self, model_manager: ModelManager, agent_manager: AgentManager):
        self.model_manager = model_manager
        self.agent_manager = agent_manager
        self.workflows: Dict[str, WorkflowConfig] = {}
        self.execution_queue: List[Dict[str, Any]] = []
        self.execution_results: Dict[str, Dict[str, Any]] = {}
        
    def create_workflow(self, request: WorkflowCreateRequest) -> WorkflowConfig:
        """Create a new workflow"""
        try:
            workflow_config = WorkflowConfig(
                id=str(uuid.uuid4()),
                name=request.name,
                description=request.description,
                nodes=request.nodes,
                connections=request.connections
            )
            
            self.workflows[workflow_config.id] = workflow_config
            
            logger.info(f"Created workflow: {workflow_config.name}", 
                       workflow_id=workflow_config.id)
            
            return workflow_config
            
        except Exception as e:
            logger.error(f"Failed to create workflow: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def list_workflows(self) -> List[Dict[str, Any]]:
        """List all workflows"""
        return [asdict(workflow) for workflow in self.workflows.values()]
    
    def get_workflow(self, workflow_id: str) -> Optional[WorkflowConfig]:
        """Get workflow by ID"""
        return self.workflows.get(workflow_id)
    
    def update_workflow(self, workflow_id: str, request: WorkflowCreateRequest) -> WorkflowConfig:
        """Update an existing workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow.name = request.name
        workflow.description = request.description
        workflow.nodes = request.nodes
        workflow.connections = request.connections
        workflow.updated_at = datetime.now()
        
        logger.info(f"Updated workflow: {workflow.name}", workflow_id=workflow_id)
        return workflow
    
    def delete_workflow(self, workflow_id: str) -> bool:
        """Delete a workflow"""
        if workflow_id in self.workflows:
            workflow = self.workflows[workflow_id]
            del self.workflows[workflow_id]
            logger.info(f"Deleted workflow: {workflow.name}", workflow_id=workflow_id)
            return True
        return False
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Execute a workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if workflow.status != "active":
            raise HTTPException(status_code=400, detail="Workflow is not active")
        
        execution_id = str(uuid.uuid4())
        execution_start = datetime.now()
        
        # Add to execution queue
        execution_record = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "status": "running",
            "start_time": execution_start,
            "input_data": input_data
        }
        
        workflow.execution_history.append(execution_record)
        
        try:
            # Simulate workflow execution
            # In a real implementation, this would traverse the workflow graph
            # and execute each node based on its type
            
            # Mock execution for demo purposes
            result = await self._simulate_workflow_execution(workflow, input_data)
            
            execution_end = datetime.now()
            execution_time = (execution_end - execution_start).total_seconds()
            
            # Update execution record
            execution_record.update({
                "status": "completed",
                "end_time": execution_end,
                "execution_time": execution_time,
                "result": result
            })
            
            # Store execution result
            self.execution_results[execution_id] = {
                "workflow_id": workflow_id,
                "result": result,
                "execution_time": execution_time,
                "completed_at": execution_end.isoformat()
            }
            
            logger.info(f"Workflow execution completed: {workflow.name}", 
                       workflow_id=workflow_id, execution_id=execution_id)
            
            return {
                "execution_id": execution_id,
                "workflow_id": workflow_id,
                "status": "completed",
                "result": result,
                "execution_time": execution_time
            }
            
        except Exception as e:
            execution_end = datetime.now()
            
            # Update execution record with error
            execution_record.update({
                "status": "failed",
                "end_time": execution_end,
                "error": str(e)
            })
            
            logger.error(f"Workflow execution failed: {workflow.name}", 
                        workflow_id=workflow_id, error=str(e))
            
            raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")
    
    async def _simulate_workflow_execution(self, workflow: WorkflowConfig, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate workflow execution for demo purposes"""
        # Simulate processing time
        await asyncio.sleep(2)
        
        # Mock result based on workflow nodes
        node_count = len(workflow.nodes)
        connection_count = len(workflow.connections)
        
        return {
            "processed_nodes": node_count,
            "connections_executed": connection_count,
            "output": f"Workflow '{workflow.name}' executed successfully with {node_count} nodes",
            "input_received": input_data,
            "execution_summary": {
                "total_nodes": node_count,
                "total_connections": connection_count,
                "workflow_type": "visual_builder"
            }
        }
    
    def get_execution_history(self, workflow_id: str) -> List[Dict[str, Any]]:
        """Get execution history for a workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return workflow.execution_history
    
    def get_execution_result(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Get execution result by execution ID"""
        return self.execution_results.get(execution_id)

# Plugin Management
@dataclass
class PluginConfig:
    """Configuration for ADK plugins"""
    id: str
    name: str
    description: str
    category: str
    version: str
    author: str
    license: str
    status: str = "installed"  # "installed", "enabled", "disabled", "error"
    code: str = ""
    configuration: Dict[str, Any] = None
    dependencies: List[str] = None
    permissions: List[str] = None
    installed_at: datetime = None
    last_used: datetime = None
    usage_count: int = 0
    
    def __post_init__(self):
        if self.configuration is None:
            self.configuration = {}
        if self.dependencies is None:
            self.dependencies = []
        if self.permissions is None:
            self.permissions = []
        if self.installed_at is None:
            self.installed_at = datetime.now()

class PluginManager:
    """Manages ADK plugins and their lifecycle"""
    
    def __init__(self, model_manager: ModelManager, agent_manager: AgentManager, workflow_manager: WorkflowManager):
        self.model_manager = model_manager
        self.agent_manager = agent_manager
        self.workflow_manager = workflow_manager
        self.plugins: Dict[str, PluginConfig] = {}
        self.plugin_registry: Dict[str, Any] = {}  # Runtime plugin instances
        self.plugin_marketplace: List[Dict[str, Any]] = []
        self.execution_history: List[Dict[str, Any]] = []
        
    def create_plugin(self, request: PluginCreateRequest) -> PluginConfig:
        """Create a new plugin"""
        try:
            plugin_config = PluginConfig(
                id=str(uuid.uuid4()),
                name=request.name,
                description=request.description,
                category=request.category,
                version=request.version,
                author=request.author,
                license=request.license,
                code=request.code,
                configuration=request.configuration,
                dependencies=request.dependencies,
                status="development"
            )
            
            self.plugins[plugin_config.id] = plugin_config
            
            logger.info(f"Created plugin: {plugin_config.name}", 
                       plugin_id=plugin_config.id, 
                       category=plugin_config.category)
            
            return plugin_config
            
        except Exception as e:
            logger.error(f"Failed to create plugin: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def install_plugin(self, plugin_data: Dict[str, Any]) -> PluginConfig:
        """Install a plugin from data"""
        try:
            plugin_config = PluginConfig(
                id=str(uuid.uuid4()),
                name=plugin_data.get("name"),
                description=plugin_data.get("description"),
                category=plugin_data.get("category"),
                version=plugin_data.get("version", "1.0.0"),
                author=plugin_data.get("author"),
                license=plugin_data.get("license", "MIT"),
                code=plugin_data.get("code", ""),
                configuration=plugin_data.get("configuration", {}),
                dependencies=plugin_data.get("dependencies", []),
                status="installed"
            )
            
            self.plugins[plugin_config.id] = plugin_config
            
            logger.info(f"Installed plugin: {plugin_config.name}", 
                       plugin_id=plugin_config.id)
            
            return plugin_config
            
        except Exception as e:
            logger.error(f"Failed to install plugin: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def list_plugins(self, category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all plugins with optional filtering"""
        plugins = list(self.plugins.values())
        
        if category:
            plugins = [p for p in plugins if p.category == category]
        if status:
            plugins = [p for p in plugins if p.status == status]
            
        return [asdict(plugin) for plugin in plugins]
    
    def get_plugin(self, plugin_id: str) -> Optional[PluginConfig]:
        """Get plugin by ID"""
        return self.plugins.get(plugin_id)
    
    def update_plugin(self, plugin_id: str, updates: Dict[str, Any]) -> PluginConfig:
        """Update plugin configuration"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
        for key, value in updates.items():
            if hasattr(plugin, key):
                setattr(plugin, key, value)
        
        logger.info(f"Updated plugin: {plugin.name}", plugin_id=plugin_id)
        return plugin
    
    def delete_plugin(self, plugin_id: str) -> bool:
        """Delete a plugin"""
        if plugin_id in self.plugins:
            plugin = self.plugins[plugin_id]
            # Remove from registry if exists
            if plugin_id in self.plugin_registry:
                del self.plugin_registry[plugin_id]
            
            del self.plugins[plugin_id]
            logger.info(f"Deleted plugin: {plugin.name}", plugin_id=plugin_id)
            return True
        return False
    
    def enable_plugin(self, plugin_id: str) -> PluginConfig:
        """Enable a plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
        plugin.status = "enabled"
        plugin.last_used = datetime.now()
        
        # Initialize plugin instance if code exists
        if plugin.code and plugin_id not in self.plugin_registry:
            try:
                self._initialize_plugin(plugin)
            except Exception as e:
                logger.error(f"Failed to initialize plugin {plugin.name}: {e}")
                plugin.status = "error"
        
        logger.info(f"Enabled plugin: {plugin.name}", plugin_id=plugin_id)
        return plugin
    
    def disable_plugin(self, plugin_id: str) -> PluginConfig:
        """Disable a plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
        plugin.status = "disabled"
        
        # Remove from registry
        if plugin_id in self.plugin_registry:
            del self.plugin_registry[plugin_id]
        
        logger.info(f"Disabled plugin: {plugin.name}", plugin_id=plugin_id)
        return plugin
    
    async def execute_plugin(self, plugin_id: str, method: str, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a plugin method"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
        if plugin.status != "enabled":
            raise HTTPException(status_code=400, detail="Plugin is not enabled")
        
        execution_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # Record execution start
            execution_record = {
                "execution_id": execution_id,
                "plugin_id": plugin_id,
                "method": method,
                "parameters": parameters,
                "context": context,
                "status": "running",
                "start_time": start_time
            }
            
            self.execution_history.append(execution_record)
            
            # Execute plugin
            if plugin_id in self.plugin_registry:
                plugin_instance = self.plugin_registry[plugin_id]
                result = await self._execute_plugin_method(plugin_instance, method, parameters, context)
            else:
                # Execute code directly if no instance
                result = await self._execute_plugin_code(plugin, method, parameters, context)
            
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            
            # Update execution record
            execution_record.update({
                "status": "completed",
                "end_time": end_time,
                "execution_time": execution_time,
                "result": result
            })
            
            # Update plugin usage
            plugin.usage_count += 1
            plugin.last_used = end_time
            
            logger.info(f"Plugin execution completed: {plugin.name}.{method}", 
                       plugin_id=plugin_id, execution_id=execution_id)
            
            return {
                "execution_id": execution_id,
                "result": result,
                "execution_time": execution_time,
                "status": "completed"
            }
            
        except Exception as e:
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            
            # Update execution record with error
            execution_record.update({
                "status": "failed",
                "end_time": end_time,
                "execution_time": execution_time,
                "error": str(e)
            })
            
            logger.error(f"Plugin execution failed: {plugin.name}.{method}", 
                        plugin_id=plugin_id, error=str(e))
            
            raise HTTPException(status_code=500, detail=f"Plugin execution failed: {str(e)}")
    
    def _initialize_plugin(self, plugin: PluginConfig) -> None:
        """Initialize a plugin instance"""
        try:
            # Simple plugin initialization - in a real implementation,
            # this would use a secure sandbox and proper code execution
            if plugin.code:
                # Execute plugin code in a controlled environment
                plugin_instance = {
                    "config": plugin.configuration,
                    "metadata": {
                        "id": plugin.id,
                        "name": plugin.name,
                        "version": plugin.version
                    }
                }
                self.plugin_registry[plugin.id] = plugin_instance
                
        except Exception as e:
            logger.error(f"Failed to initialize plugin {plugin.name}: {e}")
            raise
    
    async def _execute_plugin_method(self, plugin_instance: Dict[str, Any], method: str, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a method on plugin instance"""
        # This is a simplified implementation
        # In reality, this would handle proper plugin method calls
        
        if method == "execute":
            return {
                "success": True,
                "data": f"Plugin {plugin_instance['metadata']['name']} executed with params: {parameters}",
                "context": context
            }
        elif method == "configure":
            plugin_instance["config"].update(parameters)
            return {"success": True, "configuration": plugin_instance["config"]}
        else:
            raise ValueError(f"Unknown plugin method: {method}")
    
    async def _execute_plugin_code(self, plugin: PluginConfig, method: str, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin code directly"""
        # This is a simplified implementation
        # In reality, this would use a secure sandbox for code execution
        
        if plugin.category == "workflow":
            # Workflow plugin execution
            return {
                "success": True,
                "workflow_result": f"Workflow plugin {plugin.name} executed {method}",
                "parameters": parameters,
                "context": context
            }
        elif plugin.category == "tool":
            # Tool plugin execution
            return {
                "success": True,
                "tool_result": f"Tool plugin {plugin.name} performed {method}",
                "parameters": parameters,
                "context": context
            }
        elif plugin.category == "integration":
            # Integration plugin execution
            return {
                "success": True,
                "integration_result": f"Integration plugin {plugin.name} connected to {method}",
                "parameters": parameters,
                "context": context
            }
        else:
            # Generic plugin execution
            return {
                "success": True,
                "result": f"Plugin {plugin.name} executed {method}",
                "parameters": parameters,
                "context": context
            }
    
    def get_plugin_marketplace(self) -> List[Dict[str, Any]]:
        """Get available plugins from marketplace"""
        return self.plugin_marketplace
    
    def add_to_marketplace(self, plugin_data: Dict[str, Any]) -> None:
        """Add plugin to marketplace"""
        self.plugin_marketplace.append(plugin_data)
    
    def get_execution_history(self, plugin_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get plugin execution history"""
        if plugin_id:
            return [exec_record for exec_record in self.execution_history 
                   if exec_record["plugin_id"] == plugin_id]
        return self.execution_history
    
    def validate_plugin_security(self, plugin_code: str) -> Dict[str, Any]:
        """Validate plugin code for security issues"""
        security_issues = []
        
        # Basic security checks
        dangerous_functions = ["eval", "exec", "open", "import", "__import__"]
        for func in dangerous_functions:
            if func in plugin_code:
                security_issues.append(f"Potentially dangerous function: {func}")
        
        # Check for file system access
        if "file" in plugin_code.lower() or "path" in plugin_code.lower():
            security_issues.append("File system access detected")
        
        # Check for network access
        if "http" in plugin_code.lower() or "socket" in plugin_code.lower():
            security_issues.append("Network access detected")
        
        return {
            "is_safe": len(security_issues) == 0,
            "issues": security_issues,
            "warnings": ["Always review plugin code before installation"] if security_issues else []
        }

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

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]
    connections: List[str] = []

class WorkflowConnection(BaseModel):
    id: str
    sourceId: str
    targetId: str

class WorkflowCreateRequest(BaseModel):
    name: str
    description: str
    nodes: List[WorkflowNode]
    connections: List[WorkflowConnection]

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    input_data: Dict[str, Any] = {}

# Plugin Management Models
class PluginConfig(BaseModel):
    """Plugin configuration schema"""
    name: str
    version: str
    author: str
    description: str
    category: str
    license: str
    dependencies: List[str] = []
    configuration: Dict[str, Any] = {}
    permissions: List[str] = []

class PluginCreateRequest(BaseModel):
    """Request to create a new plugin"""
    name: str
    description: str
    category: str
    version: str = "1.0.0"
    author: str
    license: str = "MIT"
    code: str
    configuration: Dict[str, Any] = {}
    dependencies: List[str] = []
    tests: List[Dict[str, Any]] = []

class PluginInstallRequest(BaseModel):
    """Request to install a plugin"""
    plugin_url: Optional[str] = None
    plugin_file: Optional[str] = None
    configuration: Dict[str, Any] = {}

class PluginExecutionRequest(BaseModel):
    """Request to execute a plugin"""
    plugin_id: str
    method: str
    parameters: Dict[str, Any] = {}
    context: Dict[str, Any] = {}

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
workflow_manager = WorkflowManager(model_manager, agent_manager)
plugin_manager = PluginManager(model_manager, agent_manager, workflow_manager)

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

# Workflow Management APIs
@app.get("/workflows")
async def list_workflows():
    """List all workflows"""
    return {
        "workflows": workflow_manager.list_workflows(),
        "total": len(workflow_manager.workflows)
    }

@app.post("/workflows")
async def create_workflow(request: WorkflowCreateRequest):
    """Create a new workflow"""
    workflow = workflow_manager.create_workflow(request)
    return asdict(workflow)

@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow by ID"""
    workflow = workflow_manager.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return asdict(workflow)

@app.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, request: WorkflowCreateRequest):
    """Update an existing workflow"""
    workflow = workflow_manager.update_workflow(workflow_id, request)
    return asdict(workflow)

@app.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    success = workflow_manager.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@app.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, request: WorkflowExecutionRequest):
    """Execute a workflow"""
    try:
        result = await workflow_manager.execute_workflow(workflow_id, request.input_data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflows/{workflow_id}/history")
async def get_workflow_history(workflow_id: str):
    """Get execution history for a workflow"""
    try:
        history = workflow_manager.get_execution_history(workflow_id)
        return {"history": history}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/executions/{execution_id}")
async def get_execution_result(execution_id: str):
    """Get execution result by execution ID"""
    result = workflow_manager.get_execution_result(execution_id)
    if not result:
        raise HTTPException(status_code=404, detail="Execution not found")
    return result

@app.get("/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get workflow status and summary"""
    workflow = workflow_manager.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    recent_executions = workflow.execution_history[-5:] if workflow.execution_history else []
    
    return {
        "workflow_id": workflow_id,
        "status": workflow.status,
        "node_count": len(workflow.nodes),
        "connection_count": len(workflow.connections),
        "execution_count": len(workflow.execution_history),
        "recent_executions": recent_executions,
        "last_execution": recent_executions[-1] if recent_executions else None
    }

# Plugin Management APIs
@app.get("/plugins")
async def list_plugins(category: Optional[str] = None, status: Optional[str] = None):
    """List all plugins with optional filtering"""
    try:
        plugins = plugin_manager.list_plugins(category, status)
        return {
            "plugins": plugins,
            "total": len(plugins)
        }
    except Exception as e:
        logger.error(f"Error listing plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins")
async def create_plugin(request: PluginCreateRequest):
    """Create a new plugin"""
    try:
        # Validate plugin code security
        security_check = plugin_manager.validate_plugin_security(request.code)
        if not security_check["is_safe"]:
            raise HTTPException(status_code=400, detail=f"Plugin security validation failed: {security_check['issues']}")
        
        plugin = plugin_manager.create_plugin(request)
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plugins/{plugin_id}")
async def get_plugin(plugin_id: str):
    """Get plugin by ID"""
    try:
        plugin = plugin_manager.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/plugins/{plugin_id}")
async def update_plugin(plugin_id: str, updates: Dict[str, Any]):
    """Update plugin configuration"""
    try:
        plugin = plugin_manager.update_plugin(plugin_id, updates)
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/plugins/{plugin_id}")
async def delete_plugin(plugin_id: str):
    """Delete a plugin"""
    try:
        success = plugin_manager.delete_plugin(plugin_id)
        if not success:
            raise HTTPException(status_code=404, detail="Plugin not found")
        return {"message": "Plugin deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/{plugin_id}/enable")
async def enable_plugin(plugin_id: str):
    """Enable a plugin"""
    try:
        plugin = plugin_manager.enable_plugin(plugin_id)
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/{plugin_id}/disable")
async def disable_plugin(plugin_id: str):
    """Disable a plugin"""
    try:
        plugin = plugin_manager.disable_plugin(plugin_id)
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disabling plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/{plugin_id}/execute")
async def execute_plugin(plugin_id: str, request: PluginExecutionRequest):
    """Execute a plugin method"""
    try:
        result = await plugin_manager.execute_plugin(
            plugin_id, 
            request.method, 
            request.parameters, 
            request.context
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing plugin {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plugins/{plugin_id}/history")
async def get_plugin_history(plugin_id: str):
    """Get execution history for a plugin"""
    try:
        history = plugin_manager.get_execution_history(plugin_id)
        return {"history": history}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting plugin history {plugin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plugins/marketplace")
async def get_plugin_marketplace():
    """Get available plugins from marketplace"""
    try:
        marketplace = plugin_manager.get_plugin_marketplace()
        return {"plugins": marketplace}
    except Exception as e:
        logger.error(f"Error getting marketplace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/marketplace")
async def add_to_marketplace(plugin_data: Dict[str, Any]):
    """Add plugin to marketplace"""
    try:
        plugin_manager.add_to_marketplace(plugin_data)
        return {"message": "Plugin added to marketplace successfully"}
    except Exception as e:
        logger.error(f"Error adding to marketplace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/validate")
async def validate_plugin_security(plugin_code: str):
    """Validate plugin code for security issues"""
    try:
        validation_result = plugin_manager.validate_plugin_security(plugin_code)
        return validation_result
    except Exception as e:
        logger.error(f"Error validating plugin security: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/install")
async def install_plugin(request: PluginInstallRequest):
    """Install a plugin from URL or file"""
    try:
        if request.plugin_url:
            # Download and install from URL
            # This would implement actual HTTP download
            plugin_data = {"name": "Plugin from URL", "description": "Downloaded plugin"}
        elif request.plugin_file:
            # Install from file content
            plugin_data = {"name": "Plugin from file", "description": "File-based plugin"}
        else:
            raise HTTPException(status_code=400, detail="Either plugin_url or plugin_file must be provided")
        
        plugin = plugin_manager.install_plugin(plugin_data)
        return asdict(plugin)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error installing plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        "workflows": {
            "total": len(workflow_manager.workflows),
            "active": len([w for w in workflow_manager.workflows.values() if w.status == "active"]),
            "total_executions": sum(len(w.execution_history) for w in workflow_manager.workflows.values())
        },
        "plugins": {
            "total": len(plugin_manager.plugins),
            "enabled": len([p for p in plugin_manager.plugins.values() if p.status == "enabled"]),
            "total_executions": len(plugin_manager.execution_history),
            "marketplace": len(plugin_manager.plugin_marketplace)
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