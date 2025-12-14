<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    settings, 
    models, 
    agents,
    storeActions 
  } from '$stores';
  import { 
    Settings as SettingsIcon, 
    Save, 
    Plus, 
    Edit, 
    Trash2, 
    Bot, 
    Cpu, 
    Key, 
    Server, 
    Database,
    Shield,
    Monitor,
    Bell,
    Globe,
    Zap
  } from 'lucide-svelte';

  let activeTab = $state('general');
  let isLoading = $state(false);
  let hasUnsavedChanges = $state(false);

  // General settings
  let appName = $state('Google ADK Agent Platform');
  let appDescription = $state('AI-powered agent development platform');
  let autoSave = $state(true);
  let theme = $state('dark');
  let language = $state('en');
  let debugMode = $state(false);

  // Model settings
  let selectedModel = $state('');
  let modelName = $state('');
  let modelType = $state('api');
  let modelProvider = $state('openai');
  let modelId = $state('');
  let apiBase = $state('');
  let apiKey = $state('');
  let modelTemperature = $state(1.0);
  let modelMaxTokens = $state(2048);

  // Agent settings
  let agentName = $state('');
  let agentDescription = $state('');
  let agentSystemPrompt = $state('You are a helpful AI assistant.');
  let agentModel = $state('');
  let agentTools = $state<string[]>([]);

  // Security settings
  let sessionTimeout = $state(3600);
  let enableAudit = $state(true);
  let allowedDomains = $state('localhost, 127.0.0.1');
  let maxRequestsPerHour = $state(1000);

  // Notification settings
  let emailNotifications = $state(true);
  let workflowAlerts = $state(true);
  let systemAlerts = $state(true);
  let executionAlerts = $state(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const modelProviders = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'minimax', label: 'MiniMax' },
    { value: 'google', label: 'Google' },
    { value: 'azure', label: 'Azure OpenAI' }
  ];

  const modelTypes = [
    { value: 'api', label: 'API Model' },
    { value: 'local', label: 'Local Model' },
    { value: 'custom', label: 'Custom Model' }
  ];

  const themes = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'System' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: 'Chinese' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  onMount(() => {
    loadSettings();
  });

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        appName = parsed.appName || appName;
        appDescription = parsed.appDescription || appDescription;
        autoSave = parsed.autoSave ?? autoSave;
        theme = parsed.theme || theme;
        language = parsed.language || language;
        debugMode = parsed.debugMode ?? debugMode;
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  };

  const saveSettings = async () => {
    isLoading = true;
    
    try {
      // Save to localStorage
      const settings = {
        appName,
        appDescription,
        autoSave,
        theme,
        language,
        debugMode
      };
      
      localStorage.setItem('app-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      storeActions.addSuccess('Settings saved successfully');
      hasUnsavedChanges = false;
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to save settings');
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const addModel = async () => {
    if (!modelName.trim() || !modelId.trim()) {
      storeActions.addError('Model name and ID are required');
      return;
    }

    isLoading = true;
    
    try {
      const modelConfig = {
        name: modelName,
        type: modelType,
        provider: modelProvider,
        model_id: modelId,
        api_base: apiBase || undefined,
        api_key: apiKey || undefined,
        parameters: {
          temperature: modelTemperature,
          max_tokens: modelMaxTokens
        }
      };

      // Simulate API call to add model
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local models list (in real app, this would come from API)
      storeActions.addSuccess(`Model "${modelName}" added successfully`);
      
      // Reset form
      modelName = '';
      modelId = '';
      apiBase = '';
      apiKey = '';
      modelTemperature = 1.0;
      modelMaxTokens = 2048;
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to add model');
    } finally {
      isLoading = false;
    }
  };

  const addAgent = async () => {
    if (!agentName.trim()) {
      storeActions.addError('Agent name is required');
      return;
    }

    isLoading = true;
    
    try {
      const agentConfig = {
        name: agentName,
        description: agentDescription,
        model_config: {
          name: agentModel,
          type: 'api',
          provider: 'openai',
          model_id: 'gpt-4'
        },
        system_prompt: agentSystemPrompt,
        tools: agentTools
      };

      // Simulate API call to create agent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      storeActions.addSuccess(`Agent "${agentName}" created successfully`);
      
      // Reset form
      agentName = '';
      agentDescription = '';
      agentSystemPrompt = 'You are a helpful AI assistant.';
      agentModel = '';
      agentTools = [];
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to create agent');
    } finally {
      isLoading = false;
    }
  };

  const exportSettings = () => {
    const settings = {
      general: {
        appName,
        appDescription,
        autoSave,
        theme,
        language,
        debugMode
      },
      models: $models,
      agents: $agents,
      security: {
        sessionTimeout,
        enableAudit,
        allowedDomains,
        maxRequestsPerHour
      },
      notifications: {
        emailNotifications,
        workflowAlerts,
        systemAlerts,
        executionAlerts
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-platform-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        // Apply general settings
        if (settings.general) {
          appName = settings.general.appName || appName;
          appDescription = settings.general.appDescription || appDescription;
          autoSave = settings.general.autoSave ?? autoSave;
          theme = settings.general.theme || theme;
          language = settings.general.language || language;
          debugMode = settings.general.debugMode ?? debugMode;
        }
        
        // Apply security settings
        if (settings.security) {
          sessionTimeout = settings.security.sessionTimeout || sessionTimeout;
          enableAudit = settings.security.enableAudit ?? enableAudit;
          allowedDomains = settings.security.allowedDomains || allowedDomains;
          maxRequestsPerHour = settings.security.maxRequestsPerHour || maxRequestsPerHour;
        }
        
        // Apply notification settings
        if (settings.notifications) {
          emailNotifications = settings.notifications.emailNotifications ?? emailNotifications;
          workflowAlerts = settings.notifications.workflowAlerts ?? workflowAlerts;
          systemAlerts = settings.notifications.systemAlerts ?? systemAlerts;
          executionAlerts = settings.notifications.executionAlerts ?? executionAlerts;
        }
        
        hasUnsavedChanges = true;
        storeActions.addSuccess('Settings imported successfully');
        setTimeout(() => storeActions.removeSuccess(-1), 3000);
        
      } catch (error) {
        storeActions.addError('Failed to import settings - invalid file format');
        setTimeout(() => storeActions.removeError(-1), 3000);
      }
    };
    
    reader.readAsText(file);
    input.value = '';
  };

  // Track changes
  $: if (activeTab === 'general') {
    hasUnsavedChanges = true;
  }
</script>

<svelte:head>
  <title>Settings - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex">
  <!-- Settings Navigation -->
  <div class="w-64 bg-surface-1 border-r border-border">
    <div class="p-4 border-b border-border">
      <h2 class="text-heading text-text-high">Settings</h2>
      <p class="text-small text-text-medium">Configure your platform</p>
    </div>
    
    <nav class="p-4 space-y-1">
      {#each tabs as tab}
        <button
          onclick={() => activeTab = tab.id}
          class="w-full flex items-center space-x-3 px-3 py-2 rounded-sharp text-left transition-colors {activeTab === tab.id ? 'bg-primary-500/10 text-primary-500' : 'text-text-medium hover:bg-surface-2 hover:text-text-high'}"
        >
          <svelte:component this={tab.icon} class="w-4 h-4" />
          <span class="text-body">{tab.label}</span>
        </button>
      {/each}
    </nav>
  </div>

  <!-- Settings Content -->
  <div class="flex-1 overflow-auto">
    <div class="p-6">
      <!-- General Settings -->
      {#if activeTab === 'general'}
        <div class="space-y-6">
          <div>
            <h1 class="text-display text-text-high mb-2">General Settings</h1>
            <p class="text-body text-text-medium">
              Configure basic application settings and preferences
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="form-label">Application Name</label>
                <input
                  type="text"
                  bind:value={appName}
                  class="form-input"
                  placeholder="Google ADK Agent Platform"
                />
              </div>

              <div>
                <label class="form-label">Description</label>
                <textarea
                  bind:value={appDescription}
                  rows="3"
                  class="form-input"
                  placeholder="AI-powered agent development platform"
                ></textarea>
              </div>

              <div>
                <label class="form-label">Theme</label>
                <select bind:value={theme} class="form-select">
                  {#each themes as themeOption}
                    <option value={themeOption.value}>{themeOption.label}</option>
                  {/each}
                </select>
              </div>

              <div>
                <label class="form-label">Language</label>
                <select bind:value={language} class="form-select">
                  {#each languages as lang}
                    <option value={lang.value}>{lang.label}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="space-y-4">
              <div class="form-group">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    bind:checked={autoSave}
                    class="form-checkbox"
                  />
                  <span class="text-body">Auto-save changes</span>
                </label>
                <p class="text-small text-text-medium ml-6">
                  Automatically save changes as you work
                </p>
              </div>

              <div class="form-group">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    bind:checked={debugMode}
                    class="form-checkbox"
                  />
                  <span class="text-body">Enable debug mode</span>
                </label>
                <p class="text-small text-text-medium ml-6">
                  Show additional debugging information
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Models Settings -->
      {#if activeTab === 'models'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-display text-text-high mb-2">Model Settings</h1>
              <p class="text-body text-text-medium">
                Configure AI models and their parameters
              </p>
            </div>
          </div>

          <!-- Add Model Form -->
          <div class="bg-surface-card border border-border rounded-sharp p-6">
            <h2 class="text-heading text-text-high mb-4">Add New Model</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Model Name</label>
                <input
                  type="text"
                  bind:value={modelName}
                  class="form-input"
                  placeholder="My Custom Model"
                />
              </div>

              <div>
                <label class="form-label">Model Type</label>
                <select bind:value={modelType} class="form-select">
                  {#each modelTypes as type}
                    <option value={type.value}>{type.label}</option>
                  {/each}
                </select>
              </div>

              <div>
                <label class="form-label">Provider</label>
                <select bind:value={modelProvider} class="form-select">
                  {#each modelProviders as provider}
                    <option value={provider.value}>{provider.label}</option>
                  {/each}
                </select>
              </div>

              <div>
                <label class="form-label">Model ID</label>
                <input
                  type="text"
                  bind:value={modelId}
                  class="form-input"
                  placeholder="gpt-4, claude-3, etc."
                />
              </div>

              <div>
                <label class="form-label">API Base URL (Optional)</label>
                <input
                  type="text"
                  bind:value={apiBase}
                  class="form-input"
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div>
                <label class="form-label">API Key</label>
                <input
                  type="password"
                  bind:value={apiKey}
                  class="form-input"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label class="form-label">Temperature</label>
                <input
                  type="number"
                  bind:value={modelTemperature}
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
                  bind:value={modelMaxTokens}
                  min="1"
                  max="32000"
                  class="form-input"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                onclick={addModel}
                disabled={isLoading}
                class="btn-primary"
              >
                <Plus class="w-4 h-4 mr-2" />
                Add Model
              </button>
            </div>
          </div>

          <!-- Existing Models -->
          <div class="bg-surface-card border border-border rounded-sharp p-6">
            <h2 class="text-heading text-text-high mb-4">Configured Models</h2>
            
            <div class="space-y-3">
              {#each $models as model}
                <div class="flex items-center justify-between p-3 bg-surface-2 rounded-sharp border border-border">
                  <div class="flex items-center space-x-3">
                    <Cpu class="w-5 h-5 text-primary-500" />
                    <div>
                      <div class="text-body font-medium text-text-high">{model.name}</div>
                      <div class="text-small text-text-medium">{model.provider} - {model.model_id}</div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button class="btn-secondary p-2" title="Edit">
                      <Edit class="w-4 h-4" />
                    </button>
                    <button class="btn-secondary p-2 text-error" title="Delete">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              {/each}
              
              {#if $models.length === 0}
                <div class="text-center py-8 text-text-medium">
                  No models configured yet. Add your first model above.
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Agents Settings -->
      {#if activeTab === 'agents'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-display text-text-high mb-2">Agent Settings</h1>
              <p class="text-body text-text-medium">
                Create and manage AI agents
              </p>
            </div>
          </div>

          <!-- Create Agent Form -->
          <div class="bg-surface-card border border-border rounded-sharp p-6">
            <h2 class="text-heading text-text-high mb-4">Create New Agent</h2>
            
            <div class="space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Agent Name</label>
                  <input
                    type="text"
                    bind:value={agentName}
                    class="form-input"
                    placeholder="Customer Support Bot"
                  />
                </div>

                <div>
                  <label class="form-label">Model</label>
                  <select bind:value={agentModel} class="form-select">
                    <option value="">Select a model</option>
                    {#each $models as model}
                      <option value={model.name}>{model.name}</option>
                    {/each}
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label">Description</label>
                <textarea
                  bind:value={agentDescription}
                  rows="2"
                  class="form-input"
                  placeholder="A helpful customer support assistant"
                ></textarea>
              </div>

              <div>
                <label class="form-label">System Prompt</label>
                <textarea
                  bind:value={agentSystemPrompt}
                  rows="4"
                  class="form-input"
                  placeholder="You are a helpful AI assistant..."
                ></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                onclick={addAgent}
                disabled={isLoading}
                class="btn-primary"
              >
                <Plus class="w-4 h-4 mr-2" />
                Create Agent
              </button>
            </div>
          </div>

          <!-- Existing Agents -->
          <div class="bg-surface-card border border-border rounded-sharp p-6">
            <h2 class="text-heading text-text-high mb-4">Configured Agents</h2>
            
            <div class="space-y-3">
              {#each $agents as agent}
                <div class="flex items-center justify-between p-3 bg-surface-2 rounded-sharp border border-border">
                  <div class="flex items-center space-x-3">
                    <Bot class="w-5 h-5 text-primary-500" />
                    <div>
                      <div class="text-body font-medium text-text-high">{agent.name}</div>
                      <div class="text-small text-text-medium">{agent.description}</div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button class="btn-secondary p-2" title="Edit">
                      <Edit class="w-4 h-4" />
                    </button>
                    <button class="btn-secondary p-2 text-error" title="Delete">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              {/each}
              
              {#if $agents.length === 0}
                <div class="text-center py-8 text-text-medium">
                  No agents created yet. Create your first agent above.
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Security Settings -->
      {#if activeTab === 'security'}
        <div class="space-y-6">
          <div>
            <h1 class="text-display text-text-high mb-2">Security Settings</h1>
            <p class="text-body text-text-medium">
              Configure security policies and access controls
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="form-label">Session Timeout (seconds)</label>
                <input
                  type="number"
                  bind:value={sessionTimeout}
                  min="300"
                  max="86400"
                  class="form-input"
                />
              </div>

              <div>
                <label class="form-label">Max Requests Per Hour</label>
                <input
                  type="number"
                  bind:value={maxRequestsPerHour}
                  min="100"
                  max="10000"
                  class="form-input"
                />
              </div>

              <div>
                <label class="form-label">Allowed Domains</label>
                <textarea
                  bind:value={allowedDomains}
                  rows="2"
                  class="form-input"
                  placeholder="localhost, 127.0.0.1, yourdomain.com"
                ></textarea>
              </div>
            </div>

            <div class="space-y-4">
              <div class="form-group">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    bind:checked={enableAudit}
                    class="form-checkbox"
                  />
                  <span class="text-body">Enable audit logging</span>
                </label>
                <p class="text-small text-text-medium ml-6">
                  Log all user actions for security monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Notifications Settings -->
      {#if activeTab === 'notifications'}
        <div class="space-y-6">
          <div>
            <h1 class="text-display text-text-high mb-2">Notification Settings</h1>
            <p class="text-body text-text-medium">
              Configure alerts and notifications
            </p>
          </div>

          <div class="space-y-4">
            <div class="form-group">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  bind:checked={emailNotifications}
                  class="form-checkbox"
                />
                <span class="text-body">Email notifications</span>
              </label>
              <p class="text-small text-text-medium ml-6">
                Receive notifications via email
              </p>
            </div>

            <div class="form-group">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  bind:checked={workflowAlerts}
                  class="form-checkbox"
                />
                <span class="text-body">Workflow alerts</span>
              </label>
              <p class="text-small text-text-medium ml-6">
                Get notified when workflows complete or fail
              </p>
            </div>

            <div class="form-group">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  bind:checked={systemAlerts}
                  class="form-checkbox"
                />
                <span class="text-body">System alerts</span>
              </label>
              <p class="text-small text-text-medium ml-6">
                Receive alerts about system issues and maintenance
              </p>
            </div>

            <div class="form-group">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  bind:checked={executionAlerts}
                  class="form-checkbox"
                />
                <span class="text-body">Execution alerts</span>
              </label>
              <p class="text-small text-text-medium ml-6">
                Get notified about individual agent executions
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Settings Actions -->
      <div class="flex items-center justify-between pt-6 border-t border-border">
        <div class="flex items-center space-x-3">
          <button
            onclick={exportSettings}
            class="btn-secondary"
          >
            <Database class="w-4 h-4 mr-2" />
            Export Settings
          </button>
          
          <label class="btn-secondary cursor-pointer">
            <input
              type="file"
              accept=".json"
              on:change={importSettings}
              class="hidden"
            />
            <Globe class="w-4 h-4 mr-2 inline" />
            Import Settings
          </label>
        </div>

        <div class="flex items-center space-x-3">
          {#if hasUnsavedChanges}
            <span class="text-small text-warning">You have unsaved changes</span>
          {/if}
          
          <button
            onclick={saveSettings}
            disabled={isLoading || !hasUnsavedChanges}
            class="btn-primary {!hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            {#if isLoading}
              <Zap class="w-4 h-4 mr-2 animate-spin" />
              Saving...
            {:else}
              <Save class="w-4 h-4 mr-2" />
              Save Settings
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>