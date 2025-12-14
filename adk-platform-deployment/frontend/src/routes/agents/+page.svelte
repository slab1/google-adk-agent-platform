<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    agents, 
    models,
    agentMetrics,
    currentAgent,
    storeActions 
  } from '$stores';
  import { 
    Plus, 
    Search, 
    Filter, 
    Bot, 
    MessageSquare, 
    Settings, 
    Trash2, 
    Edit, 
    Play, 
    Pause, 
    BarChart3, 
    Activity,
    Clock,
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Eye,
    RefreshCw,
    TrendingUp,
    Users,
    Cpu,
    Zap,
    Target,
    DollarSign,
    Download,
    Copy,
    GitBranch
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedFilter = $state('all');
  let showAddModal = $state(false);
  let showDetailsModal = $state(false);
  let showMetricsModal = $state(false);
  let isLoading = $state(false);
  let selectedAgentId = $state<string | null>(null);

  // New agent form
  let newAgentName = $state('');
  let newAgentDescription = $state('');
  let newAgentModel = $state('');
  let newAgentSystemPrompt = $state('You are a helpful AI assistant designed to provide accurate and useful information to users.');
  let newAgentTemperature = $state(1.0);
  let newAgentMaxIterations = $state(5);
  let newAgentTools = $state<string[]>([]);

  const availableTools = [
    { id: 'web_search', name: 'Web Search', description: 'Search the internet for information' },
    { id: 'code_execution', name: 'Code Execution', description: 'Run and execute code snippets' },
    { id: 'file_operations', name: 'File Operations', description: 'Read, write, and manage files' },
    { id: 'api_calls', name: 'API Calls', description: 'Make HTTP requests to external APIs' },
    { id: 'database', name: 'Database Access', description: 'Query and manipulate databases' },
    { id: 'email', name: 'Email', description: 'Send and receive emails' },
    { id: 'calendar', name: 'Calendar', description: 'Manage calendar events and scheduling' },
    { id: 'image_analysis', name: 'Image Analysis', description: 'Analyze and understand images' }
  ];

  const statusColors = {
    active: 'text-success',
    inactive: 'text-text-medium',
    error: 'text-error',
    training: 'text-warning'
  };

  const statusIcons = {
    active: CheckCircle2,
    inactive: Clock,
    error: XCircle,
    training: RefreshCw
  };

  onMount(() => {
    loadAgents();
    loadAgentMetrics();
  });

  const loadAgents = () => {
    // Agents are loaded from stores initialized data
  };

  const loadAgentMetrics = () => {
    // Metrics are loaded from stores initialized data
  };

  const filteredAgents = $derived(
    $agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'active' && agent.status === 'active') ||
                           (selectedFilter === 'inactive' && agent.status === 'inactive') ||
                           (selectedFilter === 'recent' && isRecent(agent.last_used));
      
      return matchesSearch && matchesFilter;
    })
  );

  const isRecent = (lastUsed: string) => {
    if (!lastUsed) return false;
    const lastUsedDate = new Date(lastUsed);
    const now = new Date();
    const daysDiff = (now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Used within last 7 days
  };

  const getAgentMetrics = (agentId: string) => {
    return $agentMetrics.find(m => m.agentId === agentId);
  };

  const handleAddAgent = async () => {
    if (!newAgentName.trim() || !newAgentModel) {
      storeActions.addError('Agent name and model are required');
      return;
    }

    isLoading = true;
    
    try {
      const agentConfig = {
        id: `agent-${Date.now()}`,
        name: newAgentName,
        description: newAgentDescription,
        model: newAgentModel,
        status: 'inactive' as const,
        created_at: new Date().toISOString(),
        conversations: 0,
        system_prompt: newAgentSystemPrompt,
        tools: newAgentTools,
        temperature: newAgentTemperature,
        max_iterations: newAgentMaxIterations,
        last_used: new Date().toISOString()
      };

      storeActions.addAgent(agentConfig);
      storeActions.addSuccess(`Agent "${newAgentName}" created successfully`);
      
      // Reset form
      resetNewAgentForm();
      showAddModal = false;
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to create agent');
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const resetNewAgentForm = () => {
    newAgentName = '';
    newAgentDescription = '';
    newAgentModel = '';
    newAgentSystemPrompt = 'You are a helpful AI assistant designed to provide accurate and useful information to users.';
    newAgentTemperature = 1.0;
    newAgentMaxIterations = 5;
    newAgentTools = [];
  };

  const handleToggleStatus = (agentId: string) => {
    const agent = $agents.find(a => a.id === agentId);
    if (agent) {
      const newStatus = agent.status === 'active' ? 'inactive' : 'active';
      storeActions.updateAgent(agentId, { status: newStatus });
      storeActions.addSuccess(`Agent "${agent.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    const agent = $agents.find(a => a.id === agentId);
    if (agent && confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      storeActions.deleteAgent(agentId);
      storeActions.addSuccess(`Agent "${agent.name}" deleted successfully`);
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
    }
  };

  const duplicateAgent = (agent: any) => {
    const duplicatedAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
      name: `${agent.name} (Copy)`,
      status: 'inactive' as const,
      created_at: new Date().toISOString(),
      conversations: 0
    };
    
    storeActions.addAgent(duplicatedAgent);
    storeActions.addSuccess(`Agent "${agent.name}" duplicated successfully`);
    setTimeout(() => storeActions.removeSuccess(-1), 3000);
  };

  const viewAgentDetails = (agent: any) => {
    currentAgent.set(agent);
    selectedAgentId = agent.id;
    showDetailsModal = true;
  };

  const viewAgentMetrics = (agent: any) => {
    currentAgent.set(agent);
    selectedAgentId = agent.id;
    showMetricsModal = true;
  };

  const exportAgents = () => {
    const exportData = {
      agents: $agents,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-agents-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTool = (toolId: string) => {
    if (newAgentTools.includes(toolId)) {
      newAgentTools = newAgentTools.filter(id => id !== toolId);
    } else {
      newAgentTools = [...newAgentTools, toolId];
    }
  };

  const getModelName = (modelId: string) => {
    const model = $models.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };
</script>

<svelte:head>
  <title>Agents - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
    <div>
      <h1 class="text-heading text-text-high">AI Agents</h1>
      <p class="text-small text-text-medium">Manage your intelligent agents</p>
    </div>
    
    <div class="flex items-center space-x-3">
      <button
        onclick={exportAgents}
        class="btn-secondary text-sm"
      >
        <Download class="w-4 h-4 mr-2" />
        Export
      </button>
      
      <button
        onclick={() => showAddModal = true}
        class="btn-primary text-sm"
      >
        <Plus class="w-4 h-4 mr-2" />
        Create Agent
      </button>
    </div>
  </div>

  <!-- Controls -->
  <div class="bg-surface-1 border-b border-border px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Search and Filter -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-medium" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search agents..."
            class="form-input pl-10 w-64"
          />
        </div>
        
        <select bind:value={selectedFilter} class="form-select">
          <option value="all">All Agents</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="recent">Recently Used</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="flex items-center space-x-6 text-small text-text-medium">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-success rounded-full"></div>
          <span>{$agents.filter(a => a.status === 'active').length} Active</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-text-medium rounded-full"></div>
          <span>{$agents.filter(a => a.status === 'inactive').length} Inactive</span>
        </div>
        <div class="flex items-center space-x-2">
          <Users class="w-4 h-4" />
          <span>{$agents.length} Total</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Agents Grid -->
  <div class="flex-1 overflow-auto p-6">
    {#if filteredAgents.length === 0}
      <div class="flex items-center justify-center h-full text-center">
        <div>
          <Bot class="w-12 h-12 text-text-medium mx-auto mb-4" />
          <h3 class="text-heading text-text-high mb-2">
            {searchQuery || selectedFilter !== 'all' ? 'No agents found' : 'No agents created'}
          </h3>
          <p class="text-body text-text-medium mb-4">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first AI agent to get started'}
          </p>
          {#if !searchQuery && selectedFilter === 'all'}
            <button
              onclick={() => showAddModal = true}
              class="btn-primary"
            >
              <Plus class="w-4 h-4 mr-2" />
              Create Your First Agent
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredAgents as agent (agent.id)}
          {@const StatusIcon = statusIcons[agent.status]}
          {@const metrics = getAgentMetrics(agent.id)}
          
          <div class="bg-surface-card border border-border rounded-sharp p-6 hover:border-primary-500 transition-colors">
            <!-- Agent Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center">
                  <Bot class="w-5 h-5 text-primary-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-body font-medium text-text-high truncate">{agent.name}</h3>
                  <p class="text-small text-text-medium truncate">{agent.description}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <svelte:component this={StatusIcon} class="w-4 h-4 {statusColors[agent.status]}" />
                <select 
                  value={agent.status}
                  on:change={() => handleToggleStatus(agent.id)}
                  class="form-select text-small py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Agent Info -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between text-small">
                <span class="text-text-medium">Model</span>
                <span class="text-text-high font-medium truncate">{getModelName(agent.model)}</span>
              </div>
              
              <div class="flex items-center justify-between text-small">
                <span class="text-text-medium">Conversations</span>
                <span class="text-text-high font-mono">{agent.conversations}</span>
              </div>

              {#if agent.last_used}
                <div class="flex items-center justify-between text-small">
                  <span class="text-text-medium">Last Used</span>
                  <span class="text-text-high">{new Date(agent.last_used).toLocaleDateString()}</span>
                </div>
              {/if}

              <div class="flex items-center justify-between text-small">
                <span class="text-text-medium">Tools</span>
                <span class="text-text-high">{agent.tools.length} tools</span>
              </div>

              {#if metrics}
                <div class="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div class="text-center">
                    <div class="text-small text-text-medium">Success Rate</div>
                    <div class="text-body font-mono text-success">{metrics.successRate}%</div>
                  </div>
                  <div class="text-center">
                    <div class="text-small text-text-medium">Avg Response</div>
                    <div class="text-body font-mono text-text-high">{metrics.averageResponseTime}s</div>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Tools Preview -->
            {#if agent.tools.length > 0}
              <div class="mb-4">
                <div class="text-small text-text-medium mb-2">Tools</div>
                <div class="flex flex-wrap gap-1">
                  {#each agent.tools.slice(0, 3) as tool}
                    <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                      {tool.replace('_', ' ')}
                    </span>
                  {/each}
                  {#if agent.tools.length > 3}
                    <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-medium">
                      +{agent.tools.length - 3} more
                    </span>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Actions -->
            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  onclick={() => viewAgentMetrics(agent)}
                  class="btn-secondary text-sm"
                  title="View metrics"
                >
                  <BarChart3 class="w-4 h-4" />
                </button>
                
                <button
                  onclick={() => viewAgentDetails(agent)}
                  class="btn-secondary text-sm"
                  title="View details"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </div>

              <div class="flex space-x-2">
                <button
                  onclick={() => duplicateAgent(agent)}
                  class="btn-secondary text-sm"
                  title="Duplicate agent"
                >
                  <Copy class="w-4 h-4" />
                </button>
                
                <button
                  onclick={() => storeActions.updateAgent(agent.id, {})}
                  class="btn-secondary text-sm"
                  title="Edit agent"
                >
                  <Edit class="w-4 h-4" />
                </button>
                
                <button
                  onclick={() => handleDeleteAgent(agent.id)}
                  class="btn-secondary text-sm text-error"
                  title="Delete agent"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Add Agent Modal -->
{#if showAddModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showAddModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Create New Agent</h2>
        <button onclick={() => showAddModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Agent Name</label>
            <input
              type="text"
              bind:value={newAgentName}
              class="form-input"
              placeholder="Customer Support Bot"
            />
          </div>

          <div>
            <label class="form-label">Model</label>
            <select bind:value={newAgentModel} class="form-select">
              <option value="">Select a model</option>
              {#each $models as model}
                <option value={model.id}>{model.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">Description</label>
          <textarea
            bind:value={newAgentDescription}
            rows="2"
            class="form-input"
            placeholder="A helpful customer support assistant"
          ></textarea>
        </div>

        <div>
          <label class="form-label">System Prompt</label>
          <textarea
            bind:value={newAgentSystemPrompt}
            rows="4"
            class="form-input"
            placeholder="You are a helpful AI assistant..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Temperature</label>
            <input
              type="number"
              bind:value={newAgentTemperature}
              min="0"
              max="2"
              step="0.1"
              class="form-input"
            />
          </div>

          <div>
            <label class="form-label">Max Iterations</label>
            <input
              type="number"
              bind:value={newAgentMaxIterations}
              min="1"
              max="20"
              class="form-input"
            />
          </div>
        </div>

        <div>
          <label class="form-label">Tools</label>
          <div class="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
            {#each availableTools as tool}
              <label class="flex items-center space-x-2 p-2 hover:bg-surface-2 rounded-sharp cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAgentTools.includes(tool.id)}
                  on:change={() => toggleTool(tool.id)}
                  class="form-checkbox"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-small font-medium text-text-high">{tool.name}</div>
                  <div class="text-small text-text-medium">{tool.description}</div>
                </div>
              </label>
            {/each}
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showAddModal = false}
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          onclick={handleAddAgent}
          disabled={isLoading}
          class="btn-primary {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
        >
          {#if isLoading}
            <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
            Creating...
          {:else}
            <Plus class="w-4 h-4 mr-2" />
            Create Agent
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Agent Details Modal -->
{#if showDetailsModal && $currentAgent}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showDetailsModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-4xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Agent Details: {$currentAgent.name}</h2>
        <button onclick={() => showDetailsModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Configuration -->
        <div>
          <h3 class="text-subheading text-text-high mb-4">Configuration</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Name:</span>
              <span class="text-body text-text-high font-medium">{$currentAgent.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Description:</span>
              <span class="text-body text-text-high">{$currentAgent.description}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Model:</span>
              <span class="text-body text-text-high">{getModelName($currentAgent.model)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Status:</span>
              <span class="text-body {statusColors[$currentAgent.status]} font-medium capitalize">{$currentAgent.status}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Temperature:</span>
              <span class="text-body text-text-high font-mono">{$currentAgent.temperature}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Max Iterations:</span>
              <span class="text-body text-text-high font-mono">{$currentAgent.max_iterations}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Conversations:</span>
              <span class="text-body text-text-high font-mono">{$currentAgent.conversations}</span>
            </div>
          </div>
        </div>

        <!-- System Prompt -->
        <div>
          <h3 class="text-subheading text-text-high mb-4">System Prompt</h3>
          <div class="bg-surface-2 p-4 rounded-sharp">
            <pre class="text-small text-text-high whitespace-pre-wrap">{@html $currentAgent.system_prompt}</pre>
          </div>
        </div>
      </div>

      <!-- Tools -->
      <div class="mt-6">
        <h3 class="text-subheading text-text-high mb-4">Tools</h3>
        {#if $currentAgent.tools.length > 0}
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {#each $currentAgent.tools as tool}
              {@const toolInfo = availableTools.find(t => t.id === tool)}
              <div class="p-3 bg-surface-2 rounded-sharp border border-border">
                <div class="text-body font-medium text-text-high">{toolInfo?.name || tool}</div>
                <div class="text-small text-text-medium">{toolInfo?.description || 'Custom tool'}</div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-text-medium">
            No tools configured for this agent
          </div>
        {/if}
      </div>

      <!-- Metadata -->
      <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 class="text-subheading text-text-high mb-4">Metadata</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Created:</span>
              <span class="text-body text-text-high">{new Date($currentAgent.created_at).toLocaleString()}</span>
            </div>
            {#if $currentAgent.last_used}
              <div class="flex justify-between">
                <span class="text-body text-text-medium">Last Used:</span>
                <span class="text-body text-text-high">{new Date($currentAgent.last_used).toLocaleString()}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-subheading text-text-high mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <button
              onclick={() => viewAgentMetrics($currentAgent)}
              class="btn-secondary w-full text-sm"
            >
              <BarChart3 class="w-4 h-4 mr-2" />
              View Performance Metrics
            </button>
            <button
              onclick={() => duplicateAgent($currentAgent)}
              class="btn-secondary w-full text-sm"
            >
              <Copy class="w-4 h-4 mr-2" />
              Duplicate Agent
            </button>
            <button
              onclick={() => storeActions.updateAgent($currentAgent.id, {})}
              class="btn-secondary w-full text-sm"
            >
              <Edit class="w-4 h-4 mr-2" />
              Edit Configuration
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showDetailsModal = false}
          class="btn-secondary"
        >
          Close
        </button>
        <button
          onclick={() => handleToggleStatus($currentAgent.id)}
          class="btn-primary"
        >
          {#if $currentAgent.status === 'active'}
            <Pause class="w-4 h-4 mr-2" />
            Deactivate
          {:else}
            <Play class="w-4 h-4 mr-2" />
            Activate
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Agent Metrics Modal -->
{#if showMetricsModal && $currentAgent}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showMetricsModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-6xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Performance Metrics: {$currentAgent.name}</h2>
        <button onclick={() => showMetricsModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <!-- KPI Cards -->
        {@const metrics = getAgentMetrics($currentAgent.id)}
        
        {#if metrics}
          <div class="bg-surface-2 p-4 rounded-sharp border border-border text-center">
            <MessageSquare class="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div class="text-large font-mono text-text-high">{metrics.totalRequests}</div>
            <div class="text-small text-text-medium">Total Requests</div>
          </div>
          
          <div class="bg-surface-2 p-4 rounded-sharp border border-border text-center">
            <Target class="w-8 h-8 text-success mx-auto mb-2" />
            <div class="text-large font-mono text-text-high">{metrics.successRate}%</div>
            <div class="text-small text-text-medium">Success Rate</div>
          </div>
          
          <div class="bg-surface-2 p-4 rounded-sharp border border-border text-center">
            <Clock class="w-8 h-8 text-warning mx-auto mb-2" />
            <div class="text-large font-mono text-text-high">{metrics.averageResponseTime}s</div>
            <div class="text-small text-text-medium">Avg Response Time</div>
          </div>
          
          <div class="bg-surface-2 p-4 rounded-sharp border border-border text-center">
            <DollarSign class="w-8 h-8 text-info mx-auto mb-2" />
            <div class="text-large font-mono text-text-high">${metrics.costPerInteraction}</div>
            <div class="text-small text-text-medium">Cost per Interaction</div>
          </div>
        {:else}
          <div class="lg:col-span-4 text-center py-8 text-text-medium">
            No metrics available for this agent yet
          </div>
        {/if}
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Response Time Chart -->
        <div class="bg-surface-2 p-4 rounded-sharp border border-border">
          <h3 class="text-subheading text-text-high mb-4">Response Time Trends</h3>
          <div class="h-48 bg-surface-card rounded-sharp flex items-center justify-center">
            <div class="text-center">
              <TrendingUp class="w-12 h-12 text-text-medium mx-auto mb-2" />
              <div class="text-small text-text-medium">Chart visualization would be here</div>
            </div>
          </div>
        </div>

        <!-- Usage Pattern Chart -->
        <div class="bg-surface-2 p-4 rounded-sharp border border-border">
          <h3 class="text-subheading text-text-high mb-4">Usage Patterns</h3>
          <div class="h-48 bg-surface-card rounded-sharp flex items-center justify-center">
            <div class="text-center">
              <BarChart3 class="w-12 h-12 text-text-medium mx-auto mb-2" />
              <div class="text-small text-text-medium">Usage chart would be here</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-6 bg-surface-2 p-4 rounded-sharp border border-border">
        <h3 class="text-subheading text-text-high mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-surface-card rounded-sharp">
            <div class="flex items-center space-x-3">
              <MessageSquare class="w-5 h-5 text-primary-500" />
              <div>
                <div class="text-body text-text-high">Customer inquiry handled</div>
                <div class="text-small text-text-medium">2 minutes ago</div>
              </div>
            </div>
            <div class="text-small text-success">1.2s response</div>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-surface-card rounded-sharp">
            <div class="flex items-center space-x-3">
              <MessageSquare class="w-5 h-5 text-primary-500" />
              <div>
                <div class="text-body text-text-high">Product recommendation provided</div>
                <div class="text-small text-text-medium">15 minutes ago</div>
              </div>
            </div>
            <div class="text-small text-success">0.9s response</div>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-surface-card rounded-sharp">
            <div class="flex items-center space-x-3">
              <AlertTriangle class="w-5 h-5 text-warning" />
              <div>
                <div class="text-body text-text-high">Escalation to human agent</div>
                <div class="text-small text-text-medium">1 hour ago</div>
              </div>
            </div>
            <div class="text-small text-warning">Complex query</div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showMetricsModal = false}
          class="btn-secondary"
        >
          Close
        </button>
        <button
          onclick={() => {
            // Export metrics functionality
            const exportData = {
              agent: $currentAgent,
              metrics: getAgentMetrics($currentAgent.id),
              exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `agent-metrics-${$currentAgent.name}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          class="btn-primary"
        >
          <Download class="w-4 h-4 mr-2" />
          Export Metrics
        </button>
      </div>
    </div>
  </div>
{/if}