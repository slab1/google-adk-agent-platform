"""
Backend tests for Google ADK Agent Platform
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app, model_manager, agent_manager

client = TestClient(app)

class TestModelManager:
    """Test model management functionality"""
    
    def test_model_config_creation(self):
        """Test creating model configurations"""
        from main import ModelConfig
        
        config = ModelConfig(
            name="test-model",
            type="local",
            provider="vllm",
            model_id="test-model-id",
            api_base="http://localhost:8000"
        )
        
        assert config.name == "test-model"
        assert config.type == "local"
        assert config.provider == "vllm"
        assert config.status == "inactive"
    
    def test_add_model_config(self):
        """Test adding model configurations"""
        from main import ModelConfig
        
        config = ModelConfig(
            name="test-model",
            type="api",
            provider="openai",
            model_id="gpt-4o"
        )
        
        result = model_manager.add_model_config(config)
        assert result is True
        assert "test-model" in model_manager.model_configs
    
    def test_list_models(self):
        """Test listing all models"""
        models = model_manager.list_models()
        assert isinstance(models, list)
        
        # Should have default models
        assert len(models) > 0

class TestAgentManager:
    """Test agent management functionality"""
    
    def test_create_agent(self):
        """Test creating new agents"""
        from main import ModelConfig, AgentCreateRequest
        
        # Create a test model config
        model_config = ModelConfig(
            name="test-model",
            type="api",
            provider="openai",
            model_id="gpt-4o"
        )
        model_manager.add_model_config(model_config)
        
        # Create agent request
        request = AgentCreateRequest(
            name="Test Agent",
            description="A test agent",
            model_config={
                "name": "test-model",
                "type": "api",
                "provider": "openai",
                "model_id": "gpt-4o"
            },
            system_prompt="You are a helpful assistant.",
            tools=["web_search"]
        )
        
        agent = agent_manager.create_agent(request)
        
        assert agent.name == "Test Agent"
        assert agent.description == "A test agent"
        assert agent.id in agent_manager.agents
    
    def test_list_agents(self):
        """Test listing all agents"""
        agents = agent_manager.list_agents()
        assert isinstance(agents, list)

class TestAPIEndpoints:
    """Test API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert "models_available" in data
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "system" in data
        assert "services" in data
    
    def test_list_models_endpoint(self):
        """Test models list endpoint"""
        response = client.get("/models")
        assert response.status_code == 200
        
        data = response.json()
        assert "models" in data
        assert "total" in data
        assert isinstance(data["models"], list)
    
    def test_list_agents_endpoint(self):
        """Test agents list endpoint"""
        response = client.get("/agents")
        assert response.status_code == 200
        
        data = response.json()
        assert "agents" in data
        assert "total" in data
        assert isinstance(data["agents"], list)
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert "models" in data
        assert "agents" in data
        assert "system" in data

class TestWebSocket:
    """Test WebSocket functionality"""
    
    def test_websocket_connection(self):
        """Test WebSocket connection"""
        with TestClient(app) as client:
            # Test invalid agent ID
            with client.websocket_connect("/ws/chat/invalid-agent") as websocket:
                data = websocket.receive_json()
                assert data["type"] == "error"

class TestModelTesting:
    """Test model testing functionality"""
    
    @pytest.mark.asyncio
    async def test_test_model_endpoint(self):
        """Test model testing endpoint"""
        from main import ModelTestRequest
        
        request = ModelTestRequest(
            model_config={
                "name": "test-model",
                "type": "api",
                "provider": "openai",
                "model_id": "gpt-4o"
            },
            test_prompt="Hello, world!"
        )
        
        response = client.post("/models/test", json=request.dict())
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        assert "model_name" in data

class TestChat:
    """Test chat functionality"""
    
    def test_chat_endpoint_without_agent(self):
        """Test chat endpoint with invalid agent"""
        request = {
            "agent_id": "invalid-agent",
            "message": "Hello",
            "stream": False
        }
        
        response = client.post("/chat", json=request)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_chat_with_valid_agent(self):
        """Test chat with a valid agent"""
        # This would require creating an agent first
        # For now, we'll skip this test as it requires complex setup
        pass

class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_json(self):
        """Test handling of invalid JSON"""
        response = client.post(
            "/chat",
            content=b"invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        response = client.post("/agents", json={})
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__])