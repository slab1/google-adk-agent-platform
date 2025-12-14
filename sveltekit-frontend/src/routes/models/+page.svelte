<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    models, 
    selectedModel,
    modelMetrics,
    storeActions 
  } from '$stores';
  import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Upload, 
    Settings, 
    Trash2, 
    Edit, 
    TestTube, 
    Activity, 
    Cpu, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Zap,
    Eye,
    EyeOff,
    RefreshCw,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    Globe,
    Server
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedFilter = $state('all');
  let showAddModal = $state(false);
  let showTestModal = $state(false);
  let showDetailsModal = $state(false);
  let testingModel = $state<string | null>(null);
  let isLoading = $state(false);
  let testResult = $state<any>(null);

  // New model form
  let newModelName = $state('');
  let newModelType = $state('api');
  let newModelProvider = $state('openai');
  let newModelId = $state('');
  let newModelApiBase = $state('');
  let newModelApiKey = $state('');
  let newModelTemperature = $state(1.0);
  let newModelMaxTokens = $state(2048);
  let newModelTopP = $state(0.95);

  // Test form
  let testPrompt = $state('Explain the concept of artificial intelligence in simple terms.');
  let testResults = $state<{[key: string]: any}>({});

  const modelTypes = [
    { value: 'api', label: 'API Model', icon: Globe },
    { value: 'local', label: 'Local Model', icon: Server },
    { value: 'custom', label: 'Custom Model', icon: Cpu }
  ];

  const modelProviders = [
    { value: 'openai', label: 'OpenAI', color: 'text-green-500' },
    { value: 'anthropic', label: 'Anthropic', color: 'text-orange-500' },
    { value: 'minimax', label: 'MiniMax', color: 'text-blue-500' },
    { value: 'google', label: 'Google', color: 'text-red-500' },
    { value: 'azure', label: 'Azure OpenAI', color: 'text-blue-600' },
    { value: 'vllm', label: 'vLLM', color: 'text-purple-500' },
    { value: 'custom', label: 'Custom Provider', color: 'text-gray-500' }
  ];

  const statusColors = {
    active: 'text-success',
    inactive: 'text-text-medium',
    error: 'text-error',
    testing: 'text-warning'
  };

  const statusIcons = {
    active: CheckCircle2,
    inactive: Clock,
    error: XCircle,
    testing: RefreshCw
  };

  onMount(() => {
    loadModels();
    loadModelMetrics();
  });

  const loadModels = () => {
    // Models are loaded from stores initialized data
  };

  const loadModelMetrics = () => {
    // Metrics are loaded from stores initialized data
  };

  const filteredModels = $derived(
    $models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.model_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'active' && model.status === 'active') ||
                           (selectedFilter === 'inactive' && model.status === 'inactive') ||
                           (selectedFilter === 'api' && model.type === 'api') ||
                           (selectedFilter === 'local' && model.type === 'local');
      
      return matchesSearch && matchesFilter;
    })
  );

  const getProviderInfo = (provider: string) => {
    return modelProviders.find(p => p.value === provider) || { 
      value: provider, 
      label: provider, 
      color: 'text-text-medium' 
    };
  };

  const handleAddModel = async () => {
    if (!newModelName.trim() || !newModelId.trim()) {
      storeActions.addError('Model name and ID are required');
      return;
    }

    isLoading = true;
    
    try {
      const modelConfig = {
        id: `model-${Date.now()}`,
        name: newModelName,
        type: newModelType,
        provider: newModelProvider,
        model_id: newModelId,
        status: 'inactive' as const,
        capabilities: ['chat', 'completion'],
        performance: {
          latency: 0,
          throughput: 0,
          uptime: 0
        },
        parameters: {
          temperature: newModelTemperature,
          top_p: newModelTopP,
          max_tokens: newModelMaxTokens
        },
        api_base: newModelApiBase || undefined,
        api_key: newModelApiKey ? '***' : undefined
      };

      storeActions.addModel(modelConfig);
      storeActions.addSuccess(`Model "${newModelName}" added successfully`);
      
      // Reset form
      resetNewModelForm();
      showAddModal = false;
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to add model');
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const resetNewModelForm = () => {
    newModelName = '';
    newModelType = 'api';
    newModelProvider = 'openai';
    newModelId = '';
    newModelApiBase = '';
    newModelApiKey = '';
    newModelTemperature = 1.0;
    newModelMaxTokens = 2048;
    newModelTopP = 0.95;
  };

  const handleTestModel = async (modelId: string) => {
    testingModel = modelId;
    testResult = null;
    
    try {
      // Simulate model testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const model = $models.find(m => m.id === modelId);
      testResult = {
        success: true,
        latency: Math.random() * 2000 + 500, // 500-2500ms
        tokens_per_second: Math.random() * 100 + 20, // 20-120 tps
        response: "This is a simulated test response from the AI model. The model appears to be functioning correctly and generating coherent responses to user prompts."
      };
      
      testResults[modelId] = testResult;
      storeActions.addSuccess(`Model "${model?.name}" test completed successfully`);
      
    } catch (error) {
      testResult = {
        success: false,
        error: 'Connection timeout - model may be unavailable'
      };
      testResults[modelId] = testResult;
      storeActions.addError(`Model test failed: ${error}`);
    } finally {
      testingModel = null;
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    const model = $models.find(m => m.id === modelId);
    if (model && confirm(`Are you sure you want to delete "${model.name}"?`)) {
      storeActions.deleteModel(modelId);
      storeActions.addSuccess(`Model "${model.name}" deleted successfully`);
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
    }
  };

  const handleToggleStatus = (modelId: string) => {
    const model = $models.find(m => m.id === modelId);
    if (model) {
      const newStatus = model.status === 'active' ? 'inactive' : 'active';
      storeActions.updateModel(modelId, { status: newStatus });
      storeActions.addSuccess(`Model "${model.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
    }
  };

  const exportModels = () => {
    const exportData = {
      models: $models,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-models-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewModelDetails = (model: any) => {
    selectedModel.set(model);
    showDetailsModal = true;
  };
</script>

<svelte:head>
  <title>Models - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
    <div>
      <h1 class="text-heading text-text-high">AI Models</h1>
      <p class="text-small text-text-medium">Manage your AI model configurations</p>
    </div>
    
    <div class="flex items-center space-x-3">
      <button
        onclick={exportModels}
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
        Add Model
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
            placeholder="Search models..."
            class="form-input pl-10 w-64"
          />
        </div>
        
        <select bind:value={selectedFilter} class="form-select">
          <option value="all">All Models</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="api">API Models</option>
          <option value="local">Local Models</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="flex items-center space-x-6 text-small text-text-medium">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-success rounded-full"></div>
          <span>{$models.filter(m => m.status === 'active').length} Active</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-error rounded-full"></div>
          <span>{$models.filter(m => m.status === 'error').length} Errors</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-text-medium rounded-full"></div>
          <span>{$models.filter(m => m.status === 'inactive').length} Inactive</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Models Grid -->
  <div class="flex-1 overflow-auto p-6">
    {#if filteredModels.length === 0}
      <div class="flex items-center justify-center h-full text-center">
        <div>
          <Cpu class="w-12 h-12 text-text-medium mx-auto mb-4" />
          <h3 class="text-heading text-text-high mb-2">
            {searchQuery || selectedFilter !== 'all' ? 'No models found' : 'No models configured'}
          </h3>
          <p class="text-body text-text-medium mb-4">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first AI model'}
          </p>
          {#if !searchQuery && selectedFilter === 'all'}
            <button
              onclick={() => showAddModal = true}
              class="btn-primary"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add Your First Model
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredModels as model (model.id)}
          {@const providerInfo = getProviderInfo(model.provider)}
          {@const StatusIcon = statusIcons[model.status]}
          {@const isTesting = testingModel === model.id}
          {@const hasTestResult = testResults[model.id]}
          
          <div class="bg-surface-card border border-border rounded-sharp p-6 hover:border-primary-500 transition-colors">
            <!-- Model Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center">
                  <Cpu class="w-5 h-5 text-primary-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-body font-medium text-text-high truncate">{model.name}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-small {providerInfo.color}">{providerInfo.label}</span>
                    <span class="text-small text-text-disabled">•</span>
                    <span class="text-small text-text-medium">{model.model_id}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <svelte:component this={StatusIcon} class="w-4 h-4 {statusColors[model.status]}" />
                <select 
                  value={model.status}
                  on:change={() => handleToggleStatus(model.id)}
                  class="form-select text-small py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Model Info -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between text-small">
                <span class="text-text-medium">Type</span>
                <span class="text-text-high font-medium">{model.type}</span>
              </div>
              
              <div class="flex items-center justify-between text-small">
                <span class="text-text-medium">Capabilities</span>
                <div class="flex space-x-1">
                  {#each model.capabilities as capability}
                    <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-high">{capability}</span>
                  {/each}
                </div>
              </div>

              {#if model.performance}
                <div class="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div class="text-center">
                    <div class="text-small text-text-medium">Latency</div>
                    <div class="text-body font-mono text-text-high">{model.performance.latency}ms</div>
                  </div>
                  <div class="text-center">
                    <div class="text-small text-text-medium">Uptime</div>
                    <div class="text-body font-mono text-text-high">{model.performance.uptime}%</div>
                  </div>
                </div>
              {/if}

              {#if hasTestResult}
                <div class="mt-3 p-3 bg-surface-2 rounded-sharp border border-border">
                  <div class="flex items-center space-x-2 mb-2">
                    <TestTube class="w-4 h-4 text-primary-500" />
                    <span class="text-small font-medium text-text-high">Test Results</span>
                  </div>
                  {#if hasTestResult.success}
                    <div class="space-y-1 text-small">
                      <div class="flex justify-between">
                        <span class="text-text-medium">Latency:</span>
                        <span class="text-text-high font-mono">{Math.round(hasTestResult.latency)}ms</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-text-medium">Speed:</span>
                        <span class="text-text-high font-mono">{Math.round(hasTestResult.tokens_per_second)} t/s</span>
                      </div>
                    </div>
                  {:else}
                    <div class="text-small text-error">{hasTestResult.error}</div>
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  onclick={() => handleTestModel(model.id)}
                  disabled={isTesting}
                  class="btn-secondary text-sm {isTesting ? 'opacity-50 cursor-not-allowed' : ''}"
                  title="Test model"
                >
                  {#if isTesting}
                    <RefreshCw class="w-4 h-4 animate-spin" />
                  {:else}
                    <TestTube class="w-4 h-4" />
                  {/if}
                </button>
                
                <button
                  onclick={() => viewModelDetails(model)}
                  class="btn-secondary text-sm"
                  title="View details"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </div>

              <div class="flex space-x-2">
                <button
                  onclick={() => storeActions.updateModel(model.id, {})}
                  class="btn-secondary text-sm"
                  title="Edit model"
                >
                  <Edit class="w-4 h-4" />
                </button>
                
                <button
                  onclick={() => handleDeleteModel(model.id)}
                  class="btn-secondary text-sm text-error"
                  title="Delete model"
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

<!-- Add Model Modal -->
{#if showAddModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showAddModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Add New Model</h2>
        <button onclick={() => showAddModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label class="form-label">Model Name</label>
          <input
            type="text"
            bind:value={newModelName}
            class="form-input"
            placeholder="My Custom Model"
          />
        </div>

        <div>
          <label class="form-label">Model Type</label>
          <select bind:value={newModelType} class="form-select">
            {#each modelTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="form-label">Provider</label>
          <select bind:value={newModelProvider} class="form-select">
            {#each modelProviders as provider}
              <option value={provider.value}>{provider.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="form-label">Model ID</label>
          <input
            type="text"
            bind:value={newModelId}
            class="form-input"
            placeholder="gpt-4, claude-3, minimax-m2"
          />
        </div>

        <div class="lg:col-span-2">
          <label class="form-label">API Base URL {newModelType === 'local' ? '(Optional)' : ''}</label>
          <input
            type="text"
            bind:value={newModelApiBase}
            class="form-input"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div class="lg:col-span-2">
          <label class="form-label">API Key {newModelType === 'local' ? '(Optional)' : ''}</label>
          <input
            type="password"
            bind:value={newModelApiKey}
            class="form-input"
            placeholder="sk-... or your API key"
          />
        </div>

        <div>
          <label class="form-label">Temperature</label>
          <input
            type="number"
            bind:value={newModelTemperature}
            min="0"
            max="2"
            step="0.1"
            class="form-input"
          />
        </div>

        <div>
          <label class="form-label">Max Tokens</label>
          <input
            type="number"
            bind:value={newModelMaxTokens}
            min="1"
            max="32000"
            class="form-input"
          />
        </div>

        <div class="lg:col-span-2">
          <label class="form-label">Top P</label>
          <input
            type="number"
            bind:value={newModelTopP}
            min="0"
            max="1"
            step="0.01"
            class="form-input"
          />
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
          onclick={handleAddModel}
          disabled={isLoading}
          class="btn-primary {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
        >
          {#if isLoading}
            <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
            Adding...
          {:else}
            <Plus class="w-4 h-4 mr-2" />
            Add Model
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Model Details Modal -->
{#if showDetailsModal && $selectedModel}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showDetailsModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-4xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Model Details: {$selectedModel.name}</h2>
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
              <span class="text-body text-text-high font-medium">{$selectedModel.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Type:</span>
              <span class="text-body text-text-high">{$selectedModel.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Provider:</span>
              <span class="text-body text-text-high">{$selectedModel.provider}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Model ID:</span>
              <span class="text-body text-text-high font-mono">{$selectedModel.model_id}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-body text-text-medium">Status:</span>
              <span class="text-body {statusColors[$selectedModel.status]} font-medium capitalize">{$selectedModel.status}</span>
            </div>
          </div>

          {#if $selectedModel.api_base}
            <div class="mt-4">
              <h4 class="text-small text-text-medium uppercase tracking-wide mb-2">API Configuration</h4>
              <div class="text-small text-text-high font-mono bg-surface-2 p-3 rounded-sharp">
                <div>Base URL: {$selectedModel.api_base}</div>
                {#if $selectedModel.api_key}
                  <div>API Key: {$selectedModel.api_key}</div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Parameters -->
        <div>
          <h3 class="text-subheading text-text-high mb-4">Parameters</h3>
          <div class="space-y-3">
            {#each Object.entries($selectedModel.parameters || {}) as [key, value]}
              <div class="flex justify-between">
                <span class="text-body text-text-medium capitalize">{key.replace('_', ' ')}:</span>
                <span class="text-body text-text-high font-mono">{value}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Capabilities -->
      <div class="mt-6">
        <h3 class="text-subheading text-text-high mb-4">Capabilities</h3>
        <div class="flex flex-wrap gap-2">
          {#each $selectedModel.capabilities as capability}
            <span class="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-sharp text-small">
              {capability}
            </span>
          {/each}
        </div>
      </div>

      <!-- Performance Metrics -->
      {#if $selectedModel.performance}
        <div class="mt-6">
          <h3 class="text-subheading text-text-high mb-4">Performance</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-surface-2 rounded-sharp">
              <div class="text-large font-mono text-text-high">{$selectedModel.performance.latency}ms</div>
              <div class="text-small text-text-medium">Latency</div>
            </div>
            <div class="text-center p-4 bg-surface-2 rounded-sharp">
              <div class="text-large font-mono text-text-high">{$selectedModel.performance.throughput}</div>
              <div class="text-small text-text-medium">Throughput</div>
            </div>
            <div class="text-center p-4 bg-surface-2 rounded-sharp">
              <div class="text-large font-mono text-text-high">{$selectedModel.performance.uptime}%</div>
              <div class="text-small text-text-medium">Uptime</div>
            </div>
          </div>
        </div>
      {/if}

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showDetailsModal = false}
          class="btn-secondary"
        >
          Close
        </button>
        <button
          onclick={() => handleTestModel($selectedModel.id)}
          disabled={testingModel === $selectedModel.id}
          class="btn-primary"
        >
          <TestTube class="w-4 h-4 mr-2" />
          Test Model
        </button>
      </div>
    </div>
  </div>
{/if}