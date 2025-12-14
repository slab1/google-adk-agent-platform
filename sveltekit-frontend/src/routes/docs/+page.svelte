<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Search, 
    Book, 
    Code, 
    Play, 
    Copy, 
    CheckCircle2, 
    AlertTriangle, 
    Info,
    ExternalLink,
    ChevronRight,
    Terminal,
    Globe,
    Key,
    Database,
    Workflow,
    Bot,
    Cpu
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedCategory = $state('overview');
  let selectedEndpoint = $state<string | null>(null);
  let copiedCode = $state<string | null>(null);

  const categories = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'models', label: 'Models API', icon: Cpu },
    { id: 'agents', label: 'Agents API', icon: Bot },
    { id: 'workflows', label: 'Workflows API', icon: Workflow },
    { id: 'chat', label: 'Chat API', icon: Globe },
    { id: 'analytics', label: 'Analytics API', icon: Database }
  ];

  // API Documentation Data
  const apiDocs = {
    overview: {
      title: 'Google ADK Agent Platform API',
      description: 'Comprehensive API documentation for the Google ADK Agent Development Platform. Build intelligent AI agents with our powerful REST API.',
      sections: [
        {
          title: 'Base URL',
          content: 'All API requests are made to: `https://api.adk-platform.com/v1`'
        },
        {
          title: 'Authentication',
          content: 'Authenticate requests using API keys in the Authorization header: `Authorization: Bearer YOUR_API_KEY`'
        },
        {
          title: 'Response Format',
          content: 'All responses return JSON data with consistent structure. Success responses include data, errors include error details.'
        },
        {
          title: 'Rate Limits',
          content: 'Standard tier: 1000 requests/hour. Pro tier: 10000 requests/hour. Contact support for enterprise limits.'
        },
        {
          title: 'Error Handling',
          content: 'HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)'
        }
      ]
    },
    authentication: {
      title: 'Authentication',
      description: 'Secure your API requests with API key authentication.',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/token',
          title: 'Generate API Token',
          description: 'Generate a new API token for authentication',
          parameters: [
            { name: 'api_key', type: 'string', required: true, description: 'Your platform API key' },
            { name: 'expires_in', type: 'integer', required: false, description: 'Token expiration time in seconds (default: 3600)' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "your-api-key-here",
    "expires_in": 3600
  }'`,
            response: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "created_at": "2025-12-14T12:00:00Z"
}`
          }
        }
      ]
    },
    models: {
      title: 'Models API',
      description: 'Manage AI model configurations and test model performance.',
      endpoints: [
        {
          method: 'GET',
          path: '/models',
          title: 'List Models',
          description: 'Retrieve all configured AI models',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status (active, inactive, error)' },
            { name: 'provider', type: 'string', required: false, description: 'Filter by provider (openai, anthropic, minimax, etc.)' }
          ],
          example: {
            request: `curl -X GET https://api.adk-platform.com/v1/models \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
            response: `{
  "models": [
    {
      "id": "model-1",
      "name": "MiniMax-M2 (API)",
      "type": "api",
      "provider": "minimax",
      "model_id": "minimax-m2",
      "status": "active",
      "capabilities": ["chat", "completion", "coding", "agentic"],
      "performance": {
        "latency": 89,
        "throughput": 1200,
        "uptime": 99.8
      },
      "parameters": {
        "temperature": 1.0,
        "top_p": 0.95,
        "max_tokens": 2048
      }
    }
  ],
  "total": 1
}`
          }
        },
        {
          method: 'POST',
          path: '/models',
          title: 'Create Model',
          description: 'Add a new AI model configuration',
          parameters: [
            { name: 'name', type: 'string', required: true, description: 'Human-readable model name' },
            { name: 'type', type: 'string', required: true, description: 'Model type (api, local, custom)' },
            { name: 'provider', type: 'string', required: true, description: 'Model provider' },
            { name: 'model_id', type: 'string', required: true, description: 'Provider-specific model identifier' },
            { name: 'api_base', type: 'string', required: false, description: 'Custom API base URL' },
            { name: 'api_key', type: 'string', required: false, description: 'API authentication key' },
            { name: 'parameters', type: 'object', required: false, description: 'Model parameters (temperature, max_tokens, etc.)' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/models \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Custom GPT-4",
    "type": "api",
    "provider": "openai",
    "model_id": "gpt-4",
    "parameters": {
      "temperature": 0.7,
      "max_tokens": 2048,
      "top_p": 0.95
    }
  }'`,
            response: `{
  "id": "model-2",
  "name": "Custom GPT-4",
  "type": "api",
  "provider": "openai",
  "model_id": "gpt-4",
  "status": "inactive",
  "created_at": "2025-12-14T12:00:00Z"
}`
          }
        },
        {
          method: 'POST',
          path: '/models/{id}/test',
          title: 'Test Model',
          description: 'Test a model configuration with a sample prompt',
          parameters: [
            { name: 'id', type: 'string', required: true, description: 'Model ID', in: 'path' },
            { name: 'test_prompt', type: 'string', required: true, description: 'Test prompt for model evaluation' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/models/model-1/test \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "test_prompt": "Explain quantum computing in simple terms"
  }'`,
            response: `{
  "success": true,
  "latency": 1250,
  "response": "Quantum computing is a revolutionary technology...",
  "tokens_used": 156,
  "test_completed_at": "2025-12-14T12:00:01Z"
}`
          }
        }
      ]
    },
    agents: {
      title: 'Agents API',
      description: 'Create and manage intelligent AI agents.',
      endpoints: [
        {
          method: 'GET',
          path: '/agents',
          title: 'List Agents',
          description: 'Retrieve all configured AI agents',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status (active, inactive)' },
            { name: 'model', type: 'string', required: false, description: 'Filter by associated model ID' }
          ],
          example: {
            request: `curl -X GET https://api.adk-platform.com/v1/agents \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
            response: `{
  "agents": [
    {
      "id": "agent-1",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries and support tickets",
      "model": "model-1",
      "status": "active",
      "system_prompt": "You are a helpful customer support agent.",
      "tools": ["web_search", "file_operations"],
      "temperature": 1.0,
      "max_iterations": 5,
      "conversations": 245,
      "created_at": "2025-12-14T12:00:00Z"
    }
  ],
  "total": 1
}`
          }
        },
        {
          method: 'POST',
          path: '/agents',
          title: 'Create Agent',
          description: 'Create a new AI agent configuration',
          parameters: [
            { name: 'name', type: 'string', required: true, description: 'Agent name' },
            { name: 'description', type: 'string', required: true, description: 'Agent description' },
            { name: 'model_config', type: 'object', required: true, description: 'Model configuration object' },
            { name: 'system_prompt', type: 'string', required: true, description: 'System prompt for the agent' },
            { name: 'tools', type: 'array', required: false, description: 'List of available tools' },
            { name: 'temperature', type: 'number', required: false, description: 'Sampling temperature (0.0-2.0)' },
            { name: 'max_iterations', type: 'integer', required: false, description: 'Maximum agent iterations' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/agents \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Code Review Assistant",
    "description": "AI assistant for code review and improvement suggestions",
    "model_config": {
      "name": "gpt-4",
      "type": "api",
      "provider": "openai"
    },
    "system_prompt": "You are an expert code reviewer...",
    "tools": ["code_execution", "web_search"],
    "temperature": 0.3,
    "max_iterations": 3
  }'`,
            response: `{
  "id": "agent-2",
  "name": "Code Review Assistant",
  "description": "AI assistant for code review and improvement suggestions",
  "status": "inactive",
  "created_at": "2025-12-14T12:00:00Z"
}`
          }
        }
      ]
    },
    workflows: {
      title: 'Workflows API',
      description: 'Create and manage visual workflow definitions.',
      endpoints: [
        {
          method: 'GET',
          path: '/workflows',
          title: 'List Workflows',
          description: 'Retrieve all workflow definitions',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status (draft, active, paused)' }
          ],
          example: {
            request: `curl -X GET https://api.adk-platform.com/v1/workflows \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
            response: `{
  "workflows": [
    {
      "id": "workflow-1",
      "name": "Customer Support Bot",
      "description": "Automated customer support with escalation",
      "status": "active",
      "node_count": 8,
      "connection_count": 7,
      "execution_count": 45,
      "created_at": "2025-12-14T12:00:00Z",
      "updated_at": "2025-12-14T12:00:00Z"
    }
  ],
  "total": 1
}`
          }
        },
        {
          method: 'POST',
          path: '/workflows',
          title: 'Create Workflow',
          description: 'Create a new workflow definition',
          parameters: [
            { name: 'name', type: 'string', required: true, description: 'Workflow name' },
            { name: 'description', type: 'string', required: true, description: 'Workflow description' },
            { name: 'nodes', type: 'array', required: true, description: 'Array of workflow nodes' },
            { name: 'connections', type: 'array', required: true, description: 'Array of node connections' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/workflows \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Data Processing Pipeline",
    "description": "Automated data processing workflow",
    "nodes": [
      {
        "id": "node-1",
        "type": "input",
        "position": {"x": 100, "y": 100},
        "data": {"label": "Data Source", "description": "Input data"}
      }
    ],
    "connections": []
  }'`,
            response: `{
  "id": "workflow-2",
  "name": "Data Processing Pipeline",
  "description": "Automated data processing workflow",
  "status": "draft",
  "created_at": "2025-12-14T12:00:00Z"
}`
          }
        },
        {
          method: 'POST',
          path: '/workflows/{id}/execute',
          title: 'Execute Workflow',
          description: 'Execute a workflow with input data',
          parameters: [
            { name: 'id', type: 'string', required: true, description: 'Workflow ID', in: 'path' },
            { name: 'input_data', type: 'object', required: false, description: 'Input data for workflow execution' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/workflows/workflow-1/execute \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input_data": {
      "query": "Customer support request",
      "priority": "high"
    }
  }'`,
            response: `{
  "execution_id": "exec-123",
  "workflow_id": "workflow-1",
  "status": "completed",
  "result": {
    "output": "Workflow executed successfully",
    "processed_nodes": 8,
    "connections_executed": 7
  },
  "execution_time": 2.45
}`
          }
        }
      ]
    },
    chat: {
      title: 'Chat API',
      description: 'Interactive chat interface for agents.',
      endpoints: [
        {
          method: 'POST',
          path: '/chat',
          title: 'Send Message',
          description: 'Send a message to an agent',
          parameters: [
            { name: 'agent_id', type: 'string', required: true, description: 'Target agent ID' },
            { name: 'message', type: 'string', required: true, description: 'User message content' },
            { name: 'model_override', type: 'string', required: false, description: 'Override default model' },
            { name: 'stream', type: 'boolean', required: false, description: 'Enable streaming response' }
          ],
          example: {
            request: `curl -X POST https://api.adk-platform.com/v1/chat \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agent-1",
    "message": "Hello, I need help with my account",
    "stream": false
  }'`,
            response: `{
  "response": "Hello! I'd be happy to help you with your account. What specific issue are you experiencing?",
  "model_used": "minimax-m2",
  "timestamp": "2025-12-14T12:00:00Z",
  "conversation_id": "conv-123"
}`
          }
        },
        {
          method: 'WebSocket',
          path: '/ws/chat/{agent_id}',
          title: 'WebSocket Chat',
          description: 'Real-time chat via WebSocket connection',
          parameters: [
            { name: 'agent_id', type: 'string', required: true, description: 'Target agent ID', in: 'path' }
          ],
          example: {
            request: `// JavaScript WebSocket example
const ws = new WebSocket('wss://api.adk-platform.com/v1/ws/chat/agent-1');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'message',
    data: {
      message: 'Hello, I need help'
    }
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  if (response.type === 'response') {
    console.log('Agent response:', response.message);
  }
};`,
            response: `// Server messages:
{
  "type": "response",
  "message": "Hello! How can I help you today?",
  "model": "minimax-m2",
  "timestamp": "2025-12-14T12:00:00Z"
}`
          }
        }
      ]
    },
    analytics: {
      title: 'Analytics API',
      description: 'Performance metrics and analytics data.',
      endpoints: [
        {
          method: 'GET',
          path: '/metrics',
          title: 'System Metrics',
          description: 'Retrieve system performance metrics',
          parameters: [],
          example: {
            request: `curl -X GET https://api.adk-platform.com/v1/metrics \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
            response: `{
  "models": {
    "model-1": {
      "total_requests": 1250,
      "average_latency": 890,
      "success_rate": 98.5,
      "error_rate": 1.5
    }
  },
  "agents": {
    "total": 5,
    "active_conversations": 12
  },
  "workflows": {
    "total": 8,
    "active": 6,
    "total_executions": 156
  },
  "system": {
    "cpu_percent": 45.2,
    "memory_percent": 67.8,
    "disk_percent": 34.1
  }
}`
          }
        }
      ]
    }
  };

  const filteredCategories = $derived(
    Object.entries(apiDocs).filter(([key, doc]) =>
      searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      copiedCode = type;
      setTimeout(() => {
        copiedCode = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-success text-white';
      case 'POST': return 'bg-primary-500 text-white';
      case 'PUT': return 'bg-warning text-white';
      case 'DELETE': return 'bg-error text-white';
      case 'WebSocket': return 'bg-info text-white';
      default: return 'bg-surface-2 text-text-high';
    }
  };

  onMount(() => {
    // Load initial category
    if (selectedCategory && !apiDocs[selectedCategory as keyof typeof apiDocs]) {
      selectedCategory = 'overview';
    }
  });
</script>

<svelte:head>
  <title>API Documentation - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex">
  <!-- Sidebar Navigation -->
  <div class="w-80 bg-surface-1 border-r border-border flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-border">
      <div class="flex items-center space-x-2 mb-4">
        <Book class="w-6 h-6 text-primary-500" />
        <h1 class="text-heading text-text-high">API Docs</h1>
      </div>
      
      <!-- Search -->
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-medium" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search documentation..."
          class="form-input pl-10"
        />
      </div>
    </div>

    <!-- Categories -->
    <nav class="flex-1 overflow-auto p-4">
      <div class="space-y-1">
        {#each categories as category}
          <button
            onclick={() => selectedCategory = category.id}
            class="w-full flex items-center space-x-3 px-3 py-2 rounded-sharp text-left transition-colors {selectedCategory === category.id ? 'bg-primary-500 text-white' : 'text-text-medium hover:text-text-high hover:bg-surface-2'}"
          >
            <svelte:component this={category.icon} class="w-4 h-4" />
            <span class="text-body">{category.label}</span>
          </button>
        {/each}
      </div>
    </nav>

    <!-- Quick Links -->
    <div class="p-4 border-t border-border">
      <h3 class="text-small text-text-medium uppercase tracking-wide mb-3">Quick Links</h3>
      <div class="space-y-2">
        <a
          href="https://github.com/google/adk-platform"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 text-small text-primary-500 hover:text-primary-400"
        >
          <ExternalLink class="w-3 h-3" />
          <span>GitHub Repository</span>
        </a>
        <a
          href="https://adk-platform.com/examples"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 text-small text-primary-500 hover:text-primary-400"
        >
          <Code class="w-3 h-3" />
          <span>Code Examples</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    <div class="p-8">
      {#if apiDocs[selectedCategory as keyof typeof apiDocs]}
        {@const doc = apiDocs[selectedCategory as keyof typeof apiDocs]}
        
        <!-- Category Header -->
        <div class="mb-8">
          <h1 class="text-display text-text-high mb-2">{doc.title}</h1>
          <p class="text-body text-text-medium">{doc.description}</p>
        </div>

        <!-- Overview Content -->
        {#if selectedCategory === 'overview'}
          <div class="space-y-6">
            {#each doc.sections as section}
              <div class="bg-surface-card border border-border rounded-sharp p-6">
                <h2 class="text-heading text-text-high mb-3">{section.title}</h2>
                <div class="text-body text-text-high whitespace-pre-wrap">{section.content}</div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Endpoints Content -->
        {#if doc.endpoints}
          <div class="space-y-6">
            {#each doc.endpoints as endpoint}
              <div class="bg-surface-card border border-border rounded-sharp overflow-hidden">
                <!-- Endpoint Header -->
                <div class="p-6 border-b border-border">
                  <div class="flex items-center space-x-3 mb-3">
                    <span class="px-2 py-1 rounded text-small font-mono {getMethodColor(endpoint.method)}">
                      {endpoint.method}
                    </span>
                    <code class="text-body font-mono text-text-high">{endpoint.path}</code>
                  </div>
                  
                  <h3 class="text-heading text-text-high mb-2">{endpoint.title}</h3>
                  <p class="text-body text-text-medium">{endpoint.description}</p>
                </div>

                <!-- Parameters -->
                {#if endpoint.parameters.length > 0}
                  <div class="p-6 border-b border-border">
                    <h4 class="text-subheading text-text-high mb-3">Parameters</h4>
                    <div class="overflow-x-auto">
                      <table class="w-full text-small">
                        <thead>
                          <tr class="border-b border-border">
                            <th class="text-left py-2 text-text-medium">Name</th>
                            <th class="text-left py-2 text-text-medium">Type</th>
                            <th class="text-left py-2 text-text-medium">Required</th>
                            <th class="text-left py-2 text-text-medium">Location</th>
                            <th class="text-left py-2 text-text-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {#each endpoint.parameters as param}
                            <tr class="border-b border-border">
                              <td class="py-2 font-mono text-text-high">{param.name}</td>
                              <td class="py-2 text-text-high">{param.type}</td>
                              <td class="py-2">
                                {#if param.required}
                                  <span class="text-error text-small">Required</span>
                                {:else}
                                  <span class="text-text-medium text-small">Optional</span>
                                {/if}
                              </td>
                              <td class="py-2 text-text-medium text-small">{param.in || 'body'}</td>
                              <td class="py-2 text-text-medium">{param.description}</td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  </div>
                {/if}

                <!-- Examples -->
                {#if endpoint.example}
                  <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <!-- Request Example -->
                      <div>
                        <div class="flex items-center justify-between mb-3">
                          <h4 class="text-subheading text-text-high">Request</h4>
                          <button
                            onclick={() => copyToClipboard(endpoint.example.request, `${endpoint.path}-request`)}
                            class="btn-secondary text-sm"
                          >
                            {#if copiedCode === `${endpoint.path}-request`}
                              <CheckCircle2 class="w-4 h-4 mr-1" />
                              Copied!
                            {:else}
                              <Copy class="w-4 h-4 mr-1" />
                              Copy
                            {/if}
                          </button>
                        </div>
                        <pre class="bg-surface-2 p-4 rounded-sharp overflow-x-auto text-small text-text-high">
                          <code>{endpoint.example.request}</code>
                        </pre>
                      </div>

                      <!-- Response Example -->
                      <div>
                        <div class="flex items-center justify-between mb-3">
                          <h4 class="text-subheading text-text-high">Response</h4>
                          <button
                            onclick={() => copyToClipboard(endpoint.example.response, `${endpoint.path}-response`)}
                            class="btn-secondary text-sm"
                          >
                            {#if copiedCode === `${endpoint.path}-response`}
                              <CheckCircle2 class="w-4 h-4 mr-1" />
                              Copied!
                            {:else}
                              <Copy class="w-4 h-4 mr-1" />
                              Copy
                            {/if}
                          </button>
                        </div>
                        <pre class="bg-surface-2 p-4 rounded-sharp overflow-x-auto text-small text-text-high">
                          <code>{endpoint.example.response}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      {:else}
        <!-- Category Not Found -->
        <div class="text-center py-16">
          <Book class="w-16 h-16 text-text-medium mx-auto mb-4" />
          <h2 class="text-heading text-text-high mb-2">Documentation Not Found</h2>
          <p class="text-body text-text-medium mb-6">
            The requested documentation section is not available.
          </p>
          <button
            onclick={() => selectedCategory = 'overview'}
            class="btn-primary"
          >
            <ChevronRight class="w-4 h-4 mr-2" />
            Back to Overview
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>