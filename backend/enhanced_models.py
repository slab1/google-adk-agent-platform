"""
Enhanced model integrations for Google ADK Agent Platform
Provides realistic API integrations for MiniMax-M2, OpenAI, Anthropic, and custom models
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass
import structlog
from litellm import completion, acompletion, stream_chunk_builder

logger = structlog.get_logger(__name__)

@dataclass
class ModelResponse:
    """Standardized model response format"""
    success: bool
    content: Optional[str] = None
    error: Optional[str] = None
    latency: Optional[float] = None
    tokens_used: Optional[int] = None
    model_name: Optional[str] = None

class OpenAIIntegration:
    """OpenAI API integration with error handling and rate limiting"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url or "https://api.openai.com/v1"
        self.session = None
        self.rate_limit_delay = 1.0  # Default delay between requests
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=aiohttp.ClientTimeout(total=60)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(
        self, 
        model: str, 
        messages: list, 
        **kwargs
    ) -> ModelResponse:
        """Make a chat completion request to OpenAI"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                **kwargs
            }
            
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                json=payload
            ) as response:
                
                if response.status == 429:
                    logger.warning("OpenAI rate limit hit, waiting...")
                    await asyncio.sleep(self.rate_limit_delay)
                    return await self.chat_completion(model, messages, **kwargs)
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"OpenAI API error: {response.status} - {error_text}")
                    return ModelResponse(
                        success=False,
                        error=f"API error: {response.status} - {error_text}",
                        model_name=model
                    )
                
                data = await response.json()
                end_time = asyncio.get_event_loop().time()
                latency = end_time - start_time
                
                content = data["choices"][0]["message"]["content"]
                tokens_used = data.get("usage", {}).get("total_tokens", 0)
                
                logger.info("OpenAI completion successful", 
                          model=model, latency=latency, tokens=tokens_used)
                
                return ModelResponse(
                    success=True,
                    content=content,
                    latency=latency,
                    tokens_used=tokens_used,
                    model_name=model
                )
                
        except asyncio.TimeoutError:
            logger.error("OpenAI API timeout")
            return ModelResponse(
                success=False,
                error="Request timeout",
                model_name=model
            )
        except Exception as e:
            logger.error(f"OpenAI API exception: {e}")
            return ModelResponse(
                success=False,
                error=str(e),
                model_name=model
            )

class AnthropicIntegration:
    """Anthropic Claude API integration"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url or "https://api.anthropic.com/v1"
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                "x-api-key": self.api_key,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            timeout=aiohttp.ClientTimeout(total=60)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(
        self, 
        model: str, 
        messages: list, 
        **kwargs
    ) -> ModelResponse:
        """Make a chat completion request to Anthropic"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Convert OpenAI format to Anthropic format
            system_messages = []
            chat_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_messages.append(msg["content"])
                else:
                    chat_messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            payload = {
                "model": model,
                "messages": chat_messages,
                "max_tokens": kwargs.get("max_tokens", 2048),
                **kwargs
            }
            
            if system_messages:
                payload["system"] = "\n\n".join(system_messages)
            
            async with self.session.post(
                f"{self.base_url}/messages",
                json=payload
            ) as response:
                
                if response.status == 429:
                    logger.warning("Anthropic rate limit hit")
                    await asyncio.sleep(2.0)
                    return await self.chat_completion(model, messages, **kwargs)
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Anthropic API error: {response.status} - {error_text}")
                    return ModelResponse(
                        success=False,
                        error=f"API error: {response.status} - {error_text}",
                        model_name=model
                    )
                
                data = await response.json()
                end_time = asyncio.get_event_loop().time()
                latency = end_time - start_time
                
                content = data["content"][0]["text"]
                tokens_used = data.get("usage", {}).get("input_tokens", 0)
                
                logger.info("Anthropic completion successful", 
                          model=model, latency=latency, tokens=tokens_used)
                
                return ModelResponse(
                    success=True,
                    content=content,
                    latency=latency,
                    tokens_used=tokens_used,
                    model_name=model
                )
                
        except Exception as e:
            logger.error(f"Anthropic API exception: {e}")
            return ModelResponse(
                success=False,
                error=str(e),
                model_name=model
            )

class MiniMaxIntegration:
    """MiniMax API integration"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url or "https://api.minimax.chat/v1"
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=aiohttp.ClientTimeout(total=60)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(
        self, 
        model: str, 
        messages: list, 
        **kwargs
    ) -> ModelResponse:
        """Make a chat completion request to MiniMax"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                **kwargs
            }
            
            async with self.session.post(
                f"{self.base_url}/text/chatcompletion_v2",
                json=payload
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"MiniMax API error: {response.status} - {error_text}")
                    return ModelResponse(
                        success=False,
                        error=f"API error: {response.status} - {error_text}",
                        model_name=model
                    )
                
                data = await response.json()
                end_time = asyncio.get_event_loop().time()
                latency = end_time - start_time
                
                if "choices" in data:
                    content = data["choices"][0]["message"]["content"]
                    tokens_used = data.get("usage", {}).get("total_tokens", 0)
                else:
                    # MiniMax might have a different response format
                    content = data.get("reply", "No content received")
                    tokens_used = 0
                
                logger.info("MiniMax completion successful", 
                          model=model, latency=latency, tokens=tokens_used)
                
                return ModelResponse(
                    success=True,
                    content=content,
                    latency=latency,
                    tokens_used=tokens_used,
                    model_name=model
                )
                
        except Exception as e:
            logger.error(f"MiniMax API exception: {e}")
            return ModelResponse(
                success=False,
                error=str(e),
                model_name=model
            )

class VLLMIntegration:
    """Local vLLM model integration"""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = None
        
    async def __aenter__(self):
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        self.session = aiohttp.ClientSession(
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=60)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(
        self, 
        model: str, 
        messages: list, 
        **kwargs
    ) -> ModelResponse:
        """Make a chat completion request to local vLLM server"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                **kwargs
            }
            
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                json=payload
            ) as response:
                
                if response.status == 404:
                    # Model not found, try to list available models
                    return ModelResponse(
                        success=False,
                        error=f"Model {model} not found on vLLM server",
                        model_name=model
                    )
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"vLLM API error: {response.status} - {error_text}")
                    return ModelResponse(
                        success=False,
                        error=f"API error: {response.status} - {error_text}",
                        model_name=model
                    )
                
                data = await response.json()
                end_time = asyncio.get_event_loop().time()
                latency = end_time - start_time
                
                content = data["choices"][0]["message"]["content"]
                tokens_used = data.get("usage", {}).get("total_tokens", 0)
                
                logger.info("vLLM completion successful", 
                          model=model, latency=latency, tokens=tokens_used)
                
                return ModelResponse(
                    success=True,
                    content=content,
                    latency=latency,
                    tokens_used=tokens_used,
                    model_name=model
                )
                
        except Exception as e:
            logger.error(f"vLLM API exception: {e}")
            return ModelResponse(
                success=False,
                error=str(e),
                model_name=model
            )

class ModelIntegrationFactory:
    """Factory for creating model integrations"""
    
    @staticmethod
    def create_integration(provider: str, **kwargs) -> Any:
        """Create appropriate model integration based on provider"""
        
        if provider == "openai":
            return OpenAIIntegration(**kwargs)
        elif provider == "anthropic":
            return AnthropicIntegration(**kwargs)
        elif provider == "minimax":
            return MiniMaxIntegration(**kwargs)
        elif provider == "vllm":
            return VLLMIntegration(**kwargs)
        elif provider == "ollama":
            # Ollama integration would be similar to vLLM
            return VLLMIntegration(**kwargs)
        else:
            raise ValueError(f"Unsupported provider: {provider}")

# Enhanced model manager with real integrations
class EnhancedModelManager:
    """Enhanced model manager with real API integrations"""
    
    def __init__(self):
        self.performance_metrics: Dict[str, Dict] = {}
        
    async def test_model_with_real_api(self, config, test_prompt: str) -> Dict[str, Any]:
        """Test model with real API integration"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Create integration
            if config.type == "local":
                integration = ModelIntegrationFactory.create_integration(
                    config.provider,
                    base_url=config.api_base,
                    api_key=config.api_key
                )
            else:
                integration = ModelIntegrationFactory.create_integration(
                    config.provider,
                    api_key=config.api_key,
                    base_url=config.api_base
                )
            
            # Test with real API
            async with integration as api:
                messages = [
                    {"role": "user", "content": test_prompt}
                ]
                
                response = await api.chat_completion(
                    model=config.model_id,
                    messages=messages,
                    **config.parameters
                )
                
                end_time = asyncio.get_event_loop().time()
                latency = end_time - start_time
                
                # Update metrics
                self._update_metrics(config.name, response, latency)
                
                return {
                    "success": response.success,
                    "response": response.content,
                    "error": response.error,
                    "latency": latency,
                    "tokens_used": response.tokens_used,
                    "model_name": config.name,
                    "provider": config.provider
                }
                
        except Exception as e:
            logger.error(f"Model test failed for {config.name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "model_name": config.name,
                "latency": 0
            }
    
    def _update_metrics(self, model_name: str, response: ModelResponse, latency: float):
        """Update performance metrics"""
        if model_name not in self.performance_metrics:
            self.performance_metrics[model_name] = {
                "total_requests": 0,
                "successful_requests": 0,
                "total_latency": 0.0,
                "total_tokens": 0,
                "error_count": 0,
                "last_used": None
            }
        
        metrics = self.performance_metrics[model_name]
        metrics["total_requests"] += 1
        metrics["total_latency"] += latency
        metrics["last_used"] = asyncio.get_event_loop().time()
        
        if response.success:
            metrics["successful_requests"] += 1
            if response.tokens_used:
                metrics["total_tokens"] += response.tokens_used
        else:
            metrics["error_count"] += 1
    
    def get_model_statistics(self) -> Dict[str, Any]:
        """Get comprehensive model statistics"""
        stats = {}
        
        for model_name, metrics in self.performance_metrics.items():
            if metrics["total_requests"] > 0:
                success_rate = (metrics["successful_requests"] / metrics["total_requests"]) * 100
                avg_latency = metrics["total_latency"] / metrics["total_requests"]
                
                stats[model_name] = {
                    "success_rate": round(success_rate, 2),
                    "average_latency": round(avg_latency, 2),
                    "total_requests": metrics["total_requests"],
                    "total_tokens": metrics["total_tokens"],
                    "error_count": metrics["error_count"],
                    "last_used": metrics["last_used"]
                }
        
        return stats