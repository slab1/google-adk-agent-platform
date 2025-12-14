#!/usr/bin/env python3
"""
Comprehensive test suite for Google ADK Agent Platform
Tests both frontend and backend functionality
"""

import unittest
import asyncio
import json
import time
from datetime import datetime
from typing import Dict, Any, List
import requests
import subprocess
import sys
import os
from pathlib import Path

class ADKPlatformTestSuite:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, message: str = "", duration: float = 0):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        })
        
        if not success:
            self.failed_tests.append(test_name)
            
        print(f"{status} {test_name}")
        if message:
            print(f"   {message}")
        if duration > 0:
            print(f"   Duration: {duration:.2f}s")
            
    def test_backend_imports(self):
        """Test backend module imports"""
        start_time = time.time()
        try:
            # Add backend to path
            backend_path = Path("/workspace/backend")
            if backend_path.exists():
                sys.path.insert(0, str(backend_path))
                
                # Test imports
                from main import (
                    app, 
                    model_manager, 
                    agent_manager, 
                    workflow_manager,
                    WorkflowCreateRequest,
                    WorkflowExecutionRequest
                )
                
                self.log_test("Backend Module Imports", True, "All modules imported successfully")
            else:
                self.log_test("Backend Module Imports", False, "Backend directory not found")
                
        except Exception as e:
            self.log_test("Backend Module Imports", False, f"Import error: {e}")
            
        duration = time.time() - start_time
        self.test_results[-1]["duration"] = duration
        
    def test_sveltekit_files(self):
        """Test SvelteKit frontend files"""
        start_time = time.time()
        
        frontend_path = Path("/workspace/sveltekit-frontend")
        required_files = [
            "src/routes/+page.svelte",           # Analytics
            "src/routes/builder/+page.svelte",   # Workflow Builder
            "src/routes/chat/+page.svelte",      # Chat Interface
            "src/routes/settings/+page.svelte",  # Settings
            "src/routes/models/+page.svelte",    # Models Management
            "src/routes/agents/+page.svelte",    # Agents Management
            "src/routes/templates/+page.svelte", # Templates
            "src/routes/docs/+page.svelte",      # API Documentation
            "src/routes/+layout.svelte",         # Layout
            "src/lib/stores/index.ts",           # Stores
            "src/lib/types/index.ts",            # Types
            "package.json",                      # Package config
            "svelte.config.js",                  # Svelte config
            "vite.config.ts",                    # Vite config
            "tailwind.config.js"                 # Tailwind config
        ]
        
        missing_files = []
        existing_files = []
        
        for file_path in required_files:
            full_path = frontend_path / file_path
            if full_path.exists():
                existing_files.append(file_path)
            else:
                missing_files.append(file_path)
                
        if not missing_files:
            self.log_test("SvelteKit Frontend Files", True, f"All {len(required_files)} required files present")
        else:
            self.log_test("SvelteKit Frontend Files", False, 
                         f"Missing {len(missing_files)} files: {', '.join(missing_files)}")
                         
        duration = time.time() - start_time
        self.test_results[-1]["duration"] = duration
        
    def test_component_completeness(self):
        """Test component completeness"""
        start_time = time.time()
        
        components_path = Path("/workspace/sveltekit-frontend/src/lib/components")
        required_components = [
            "Chart.svelte",
            "MetricCard.svelte", 
            "WorkflowCanvas.svelte",
            "WorkflowProperties.svelte",
            "Sidebar.svelte",
            "Header.svelte",
            "ErrorToast.svelte"
        ]
        
        missing_components = []
        
        for component in required_components:
            component_path = components_path / component
            if not component_path.exists():
                missing_components.append(component)
                
        if not missing_components:
            self.log_test("Component Completeness", True, f"All {len(required_components)} components present")
        else:
            self.log_test("Component Completeness", False, 
                         f"Missing components: {', '.join(missing_components)}")
                         
        duration = time.time() - start_time
        self.test_results[-1]["duration"] = duration
        
    def test_api_endpoints(self):
        """Test backend API endpoints"""
        start_time = time.time()
        
        # Test health endpoint
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("API Health Check", True, "Backend is responding")
            else:
                self.log_test("API Health Check", False, f"Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("API Health Check", False, f"Connection failed: {e}")
            
        # Test models endpoint
        try:
            response = requests.get(f"{self.base_url}/models", timeout=5)
            if response.status_code == 200:
                models = response.json()
                self.log_test("Models API", True, f"Found {len(models.get('models', []))} models")
            else:
                self.log_test("Models API", False, f"Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Models API", False, f"Connection failed: {e}")
            
        # Test agents endpoint
        try:
            response = requests.get(f"{self.base_url}/agents", timeout=5)
            if response.status_code == 200:
                agents = response.json()
                self.log_test("Agents API", True, f"Found {len(agents.get('agents', []))} agents")
            else:
                self.log_test("Agents API", False, f"Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Agents API", False, f"Connection failed: {e}")
            
        # Test workflows endpoint
        try:
            response = requests.get(f"{self.base_url}/workflows", timeout=5)
            if response.status_code == 200:
                workflows = response.json()
                self.log_test("Workflows API", True, f"Found {len(workflows.get('workflows', []))} workflows")
            else:
                self.log_test("Workflows API", False, f"Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Workflows API", False, f"Connection failed: {e}")
            
        # Test metrics endpoint
        try:
            response = requests.get(f"{self.base_url}/metrics", timeout=5)
            if response.status_code == 200:
                metrics = response.json()
                self.log_test("Metrics API", True, "Metrics endpoint responding")
            else:
                self.log_test("Metrics API", False, f"Status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Metrics API", False, f"Connection failed: {e}")
            
        duration = time.time() - start_time
        if self.test_results:
            self.test_results[-1]["duration"] = duration
            
    def test_workflow_functionality(self):
        """Test workflow creation and execution"""
        start_time = time.time()
        
        try:
            # Test workflow creation
            workflow_data = {
                "name": "Test Workflow",
                "description": "A test workflow for automated testing",
                "nodes": [
                    {
                        "id": "node-1",
                        "type": "input",
                        "position": {"x": 100, "y": 100},
                        "data": {"label": "Start", "description": "Workflow start"}
                    }
                ],
                "connections": []
            }
            
            response = requests.post(
                f"{self.base_url}/workflows",
                json=workflow_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                workflow = response.json()
                workflow_id = workflow.get("id")
                
                # Test workflow execution
                exec_response = requests.post(
                    f"{self.base_url}/workflows/{workflow_id}/execute",
                    json={"input_data": {"test": True}},
                    headers={"Content-Type": "application/json"},
                    timeout=15
                )
                
                if exec_response.status_code == 200:
                    exec_result = exec_response.json()
                    self.log_test("Workflow CRUD Operations", True, 
                                f"Workflow created and executed: {exec_result.get('status', 'unknown')}")
                else:
                    self.log_test("Workflow Execution", False, 
                                f"Execution failed: {exec_response.status_code}")
                    
            else:
                self.log_test("Workflow Creation", False, f"Creation failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Workflow Functionality", False, f"API error: {e}")
        except Exception as e:
            self.log_test("Workflow Functionality", False, f"Test error: {e}")
            
        duration = time.time() - start_time
        if self.test_results:
            self.test_results[-1]["duration"] = duration
            
    def test_model_operations(self):
        """Test model management operations"""
        start_time = time.time()
        
        try:
            # Test model creation
            model_data = {
                "name": "Test Model",
                "type": "api",
                "provider": "test",
                "model_id": "test-model-1",
                "parameters": {
                    "temperature": 1.0,
                    "max_tokens": 100
                }
            }
            
            response = requests.post(
                f"{self.base_url}/models",
                json=model_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                model = response.json()
                model_id = model.get("id")
                
                # Test model listing
                list_response = requests.get(f"{self.base_url}/models", timeout=5)
                if list_response.status_code == 200:
                    models = list_response.json()
                    self.log_test("Model Management", True, 
                                f"Model created and listed: {len(models.get('models', []))} total")
                else:
                    self.log_test("Model Listing", False, f"List failed: {list_response.status_code}")
                    
            else:
                self.log_test("Model Creation", False, f"Creation failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Model Operations", False, f"API error: {e}")
        except Exception as e:
            self.log_test("Model Operations", False, f"Test error: {e}")
            
        duration = time.time() - start_time
        if self.test_results:
            self.test_results[-1]["duration"] = duration
            
    def test_agent_operations(self):
        """Test agent management operations"""
        start_time = time.time()
        
        try:
            # Test agent creation
            agent_data = {
                "name": "Test Agent",
                "description": "A test agent for automated testing",
                "model_config": {
                    "name": "test-model",
                    "type": "api",
                    "provider": "test"
                },
                "system_prompt": "You are a test agent.",
                "tools": ["test_tool"]
            }
            
            response = requests.post(
                f"{self.base_url}/agents",
                json=agent_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                agent = response.json()
                agent_id = agent.get("id")
                
                # Test agent listing
                list_response = requests.get(f"{self.base_url}/agents", timeout=5)
                if list_response.status_code == 200:
                    agents = list_response.json()
                    self.log_test("Agent Management", True, 
                                f"Agent created and listed: {len(agents.get('agents', []))} total")
                else:
                    self.log_test("Agent Listing", False, f"List failed: {list_response.status_code}")
                    
            else:
                self.log_test("Agent Creation", False, f"Creation failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Agent Operations", False, f"API error: {e}")
        except Exception as e:
            self.log_test("Agent Operations", False, f"Test error: {e}")
            
        duration = time.time() - start_time
        if self.test_results:
            self.test_results[-1]["duration"] = duration
            
    def test_deployment_structure(self):
        """Test deployment package structure"""
        start_time = time.time()
        
        deployment_path = Path("/workspace/adk-platform-deployment")
        if not deployment_path.exists():
            self.log_test("Deployment Package", False, "Deployment package not found")
            return
            
        required_structure = {
            "frontend": ["Dockerfile", "nginx.conf"],
            "backend": ["main.py", "requirements.txt", "Dockerfile"],
            "docker": ["docker-compose.yml"],
            "kubernetes": ["backend-deployment.yml", "frontend-deployment.yml"],
            "monitoring": ["prometheus.yml"],
            "scripts": ["deploy.sh", "stop.sh"],
            "database": ["init.sql"],
            "README.md": True
        }
        
        missing_items = []
        existing_items = []
        
        for item, expected_files in required_structure.items():
            item_path = deployment_path / item
            if item_path.exists():
                if isinstance(expected_files, list):
                    for file in expected_files:
                        file_path = item_path / file
                        if file_path.exists():
                            existing_items.append(f"{item}/{file}")
                        else:
                            missing_items.append(f"{item}/{file}")
                else:
                    existing_items.append(item)
            else:
                missing_items.append(item)
                
        if not missing_items:
            self.log_test("Deployment Structure", True, 
                         f"All required files and directories present: {len(existing_items)} items")
        else:
            self.log_test("Deployment Structure", False, 
                         f"Missing items: {', '.join(missing_items)}")
                         
        duration = time.time() - start_time
        self.test_results[-1]["duration"] = duration
        
    def test_sveltekit_frontend_structure(self):
        """Test SvelteKit frontend page structure"""
        start_time = time.time()
        
        routes_path = Path("/workspace/sveltekit-frontend/src/routes")
        if not routes_path.exists():
            self.log_test("SvelteKit Routes", False, "Routes directory not found")
            return
            
        required_pages = {
            "+page.svelte": "Analytics Dashboard",
            "+layout.svelte": "Application Layout",
            "builder": "Workflow Builder",
            "chat": "Chat Interface", 
            "settings": "Settings Page",
            "models": "Models Management",
            "agents": "Agents Management",
            "templates": "Workflow Templates",
            "docs": "API Documentation"
        }
        
        missing_pages = []
        existing_pages = []
        
        for page_path, description in required_pages.items():
            full_path = routes_path / page_path
            if full_path.exists():
                existing_pages.append(f"{page_path} ({description})")
            else:
                missing_pages.append(f"{page_path} ({description})")
                
        if not missing_pages:
            self.log_test("SvelteKit Pages", True, 
                         f"All required pages present: {len(existing_pages)} pages")
        else:
            self.log_test("SvelteKit Pages", False, 
                         f"Missing pages: {', '.join(missing_pages)}")
                         
        duration = time.time() - start_time
        self.test_results[-1]["duration"] = duration
        
    def run_all_tests(self):
        """Run all tests in the suite"""
        print("🧪 Starting Google ADK Agent Platform Test Suite")
        print("=" * 60)
        
        # Backend tests
        print("\n📦 Backend Tests:")
        self.test_backend_imports()
        
        # Frontend tests
        print("\n🎨 Frontend Tests:")
        self.test_sveltekit_files()
        self.test_component_completeness()
        self.test_sveltekit_frontend_structure()
        
        # API tests
        print("\n🌐 API Tests:")
        self.test_api_endpoints()
        
        # Functionality tests
        print("\n⚙️ Functionality Tests:")
        self.test_workflow_functionality()
        self.test_model_operations()
        self.test_agent_operations()
        
        # Deployment tests
        print("\n🚀 Deployment Tests:")
        self.test_deployment_structure()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 Test Summary:")
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = len(self.failed_tests)
        
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {failed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
                
        # Save test results
        results_file = Path("/workspace/test_results.json")
        with open(results_file, "w") as f:
            json.dump({
                "summary": {
                    "total": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "success_rate": passed_tests/total_tests*100
                },
                "tests": self.test_results,
                "failed_tests": self.failed_tests,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
            
        print(f"\n📄 Test results saved to: {results_file}")
        
        return failed_tests == 0

def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Google ADK Agent Platform')
    parser.add_argument('--backend-url', default='http://localhost:8000',
                       help='Backend API URL for testing')
    parser.add_argument('--skip-api', action='store_true',
                       help='Skip API endpoint tests')
    parser.add_argument('--verbose', action='store_true',
                       help='Verbose output')
    
    args = parser.parse_args()
    
    # Create test suite
    suite = ADKPlatformTestSuite(args.backend_url)
    
    # Run tests
    success = suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()