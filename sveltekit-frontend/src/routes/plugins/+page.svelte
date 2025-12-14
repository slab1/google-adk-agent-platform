<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    storeActions,
    plugins,
    workflows
  } from '$stores';
  import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Upload, 
    Star, 
    Clock, 
    Shield, 
    Code, 
    Settings, 
    Trash2, 
    Edit, 
    Play, 
    Pause, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Eye,
    RefreshCw,
    Package,
    GitBranch,
    Zap,
    Cpu,
    Globe,
    Database,
    FileText,
    Mail,
    Calendar,
    BarChart3,
    Bot,
    Puzzle,
    ExternalLink,
    Copy,
    Archive
  } from 'lucide-svelte';
  import { Brain } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let selectedStatus = $state('all');
  let showCreateModal = $state(false);
  let showDetailsModal = $state(false);
  let showInstallModal = $state(false);
  let showMarketplaceModal = $state(false);
  let selectedPlugin = $state<any>(null);
  let isLoading = $state(false);
  let developmentMode = $state(false);

  // Plugin development form
  let pluginName = $state('');
  let pluginDescription = $state('');
  let pluginCategory = $state('workflow');
  let pluginVersion = $state('1.0.0');
  let pluginAuthor = $state('');
  let pluginLicense = $state('MIT');
  let pluginDependencies = $state('');
  let pluginConfig = $state('');
  let pluginCode = $state('');
  let pluginTests = $state('');

  // Plugin configuration
  let pluginConfigForm = $state<{[key: string]: any}>({});

  const categories = [
    { value: 'all', label: 'All Plugins', icon: Puzzle },
    { value: 'workflow', label: 'Workflow Nodes', icon: GitBranch },
    { value: 'model', label: 'AI Models', icon: Cpu },
    { value: 'integral-ai', label: 'Integral AI Models', icon: Brain },
    { value: 'tool', label: 'Tools', icon: Zap },
    { value: 'integration', label: 'Integrations', icon: Globe },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'communication', label: 'Communication', icon: Mail },
    { value: 'data', label: 'Data Processing', icon: Database },
    { value: 'ui', label: 'UI Components', icon: Package },
    { value: 'security', label: 'Security', icon: Shield }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'installed', label: 'Installed' },
    { value: 'available', label: 'Available' },
    { value: 'development', label: 'Development' },
    { value: 'disabled', label: 'Disabled' }
  ];

  const licenses = [
    'MIT', 'Apache 2.0', 'GPL 3.0', 'BSD 3.0', 'Proprietary', 'Custom'
  ];

  // Sample plugin marketplace
  const marketplacePlugins = [
    {
      id: 'webhook-integration',
      name: 'Webhook Integration',
      description: 'Send and receive webhooks for external system integration',
      category: 'integration',
      version: '2.1.0',
      author: 'ADK Team',
      rating: 4.8,
      downloads: 1250,
      price: 'Free',
      tags: ['webhook', 'integration', 'api'],
      features: [
        'Send webhooks to external systems',
        'Receive webhooks from external services',
        'Webhook payload transformation',
        'Retry mechanism and error handling'
      ],
      screenshots: ['webhook-flow.png', 'config-screen.png'],
      compatibility: ['v2.0.0', 'v2.1.0'],
      lastUpdated: '2025-12-10'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics Suite',
      description: 'Comprehensive analytics and reporting for AI workflows',
      category: 'analytics',
      version: '1.5.2',
      author: 'AnalyticsCorp',
      rating: 4.6,
      downloads: 890,
      price: '$29/month',
      tags: ['analytics', 'reporting', 'charts'],
      features: [
        'Custom dashboard creation',
        'Real-time metrics visualization',
        'Automated report generation',
        'Export to multiple formats'
      ],
      screenshots: ['dashboard.png', 'reports.png'],
      compatibility: ['v2.0.0+'],
      lastUpdated: '2025-12-08'
    },
    {
      id: 'slack-integration',
      name: 'Slack Integration',
      description: 'Integrate with Slack for team communication and notifications',
      category: 'communication',
      version: '3.0.1',
      author: 'Slack Inc.',
      rating: 4.9,
      downloads: 2100,
      price: 'Free',
      tags: ['slack', 'communication', 'notifications'],
      features: [
        'Send messages to Slack channels',
        'Receive messages from Slack',
        'Interactive button support',
        'Slack app integration'
      ],
      screenshots: ['slack-config.png', 'message-flow.png'],
      compatibility: ['v2.0.0+'],
      lastUpdated: '2025-12-12'
    },
    {
      id: 'database-connector',
      name: 'Database Connector',
      description: 'Connect to various databases (PostgreSQL, MySQL, MongoDB)',
      category: 'data',
      version: '2.3.0',
      author: 'DataTeam',
      rating: 4.5,
      downloads: 1560,
      price: 'Free',
      tags: ['database', 'sql', 'mongodb', 'connections'],
      features: [
        'Support for multiple database types',
        'Query optimization',
        'Connection pooling',
        'Data transformation tools'
      ],
      screenshots: ['db-config.png', 'query-builder.png'],
      compatibility: ['v2.0.0+'],
      lastUpdated: '2025-12-05'
    },
    {
      id: 'custom-validator',
      name: 'Custom Data Validator',
      description: 'Advanced data validation and sanitization plugin',
      category: 'security',
      version: '1.2.0',
      author: 'SecurityTeam',
      rating: 4.7,
      downloads: 756,
      price: 'Free',
      tags: ['validation', 'security', 'sanitization'],
      features: [
        'Custom validation rules',
        'Data sanitization',
        'Schema validation',
        'Security compliance checks'
      ],
      screenshots: ['validator-config.png', 'rules.png'],
      compatibility: ['v2.0.0+'],
      lastUpdated: '2025-12-01'
    },
    {
      id: 'code-generator',
      name: 'AI Code Generator',
      description: 'Generate code snippets using AI for various programming languages',
      category: 'tool',
      version: '2.0.3',
      author: 'CodeAI Team',
      rating: 4.8,
      downloads: 1890,
      price: '$15/month',
      tags: ['code', 'generation', 'ai', 'programming'],
      features: [
        'Multi-language code generation',
        'Code review and optimization',
        'Documentation generation',
        'Test case creation'
      ],
      screenshots: ['code-gen.png', 'languages.png'],
      compatibility: ['v2.1.0+'],
      lastUpdated: '2025-12-11'
    },
    {
      id: 'integral-ai-core',
      name: 'Integral AI Core',
      description: 'Autonomous skill learning AI that mimics human neocortex with Universal Simulators and Universal Operators',
      category: 'model',
      version: '3.0.0',
      author: 'Integral AI Team',
      rating: 4.9,
      downloads: 3400,
      price: '$99/month',
      tags: ['ai', 'autonomous-learning', 'neocortex', 'skill-learning', 'energy-efficient'],
      features: [
        'Autonomous Skill Learning without human intervention',
        'Safe and Reliable Mastery with catastrophic failure protection',
        'Energy Efficiency comparable to human brain',
        'Universal Simulators for world model creation',
        'Universal Operators for agency layer control',
        'Genesis & Stream infrastructure for real-time learning',
        'Vision, audio, and sensor data integration',
        'Neocortex simulation with cortical layer modeling'
      ],
      screenshots: ['integral-ai-architecture.png', 'learning-curves.png'],
      compatibility: ['v2.0.0+'],
      lastUpdated: '2025-12-15',
      integralAICapabilities: {
        autonomousSkillLearning: {
          id: 'asl-001',
          name: 'Autonomous Skill Learning',
          description: 'Learns new skills without human intervention',
          learningRate: 95,
          successRate: 98,
          interventionRequired: false
        },
        safeReliableMastery: {
          id: 'srm-001',
          name: 'Safe and Reliable Mastery',
          description: 'Learns without catastrophic failures',
          failureRate: 0.02, // 2% failure rate
          safetyConstraints: 12,
          catastrophicFailures: 0
        },
        energyEfficiency: {
          id: 'ee-001',
          name: 'Energy Efficiency',
          description: 'Uses energy comparable to human brain',
          energyConsumption: 20, // watts (similar to human brain)
          efficiencyRatio: 1.02, // 2% above human brain efficiency
          optimization: 'bio-inspired'
        },
        universalSimulators: [
          {
            id: 'vision-sim-001',
            name: 'Vision World Model',
            type: 'multimodal',
            capabilities: ['object_recognition', 'scene_understanding', 'temporal_prediction'],
            learningRate: 0.85
          },
          {
            id: 'audio-sim-001',
            name: 'Audio World Model',
            type: 'multimodal',
            capabilities: ['speech_recognition', 'sound_localization', 'music_understanding'],
            learningRate: 0.82
          },
          {
            id: 'sensor-sim-001',
            name: 'Sensor World Model',
            type: 'multimodal',
            capabilities: ['proprioception', 'tactile_sensing', 'spatial_awareness'],
            learningRate: 0.88
          }
        ],
        universalOperators: [
          {
            id: 'plan-op-001',
            name: 'Planning Operator',
            layer: 'planning',
            capabilities: ['goal_formation', 'strategy_development', 'resource_allocation'],
            autonomousLearning: true
          },
          {
            id: 'exec-op-001',
            name: 'Execution Operator',
            layer: 'execution',
            capabilities: ['action_selection', 'motor_control', 'real_time_adaptation'],
            autonomousLearning: true
          },
          {
            id: 'mon-op-001',
            name: 'Monitoring Operator',
            layer: 'monitoring',
            capabilities: ['state_estimation', 'error_detection', 'performance_tracking'],
            autonomousLearning: true
          }
        ],
        genesisStreamInfrastructure: {
          genesis: {
            id: 'gen-001',
            name: 'Genesis Component',
            type: 'initialization',
            neocortexSimulation: true,
            corticalLayerModeling: true,
            synapticPlasticity: true
          },
          stream: {
            id: 'stream-001',
            name: 'Stream Component',
            type: 'real-time-learning',
            continuousLearning: true,
            multimodalProcessing: true,
            energyOptimization: true
          },
          orchestrator: {
            id: 'orch-001',
            name: 'Genesis & Stream Orchestrator',
            type: 'coordination',
            realTimeCoordination: true,
            resourceOptimization: true,
            safetyMonitoring: true
          }
        },
        neocortexMimicry: {
          corticalLayers: [
            { name: 'Input Layer', neuronCount: 1000000, plasticity: 0.9 },
            { name: 'Association Layer', neuronCount: 500000, plasticity: 0.85 },
            { name: 'Motor Layer', neuronCount: 100000, plasticity: 0.8 },
            { name: 'Multimodal Layer', neuronCount: 200000, plasticity: 0.88 }
          ],
          synapticPlasticity: {
            longTermPotentiation: 0.85,
            longTermDepression: 0.75,
            spikeTiming: 0.82,
            metaplasticity: 0.9
          },
          cognitiveArchitecture: {
            workingMemory: { capacity: 7, duration: 30, modalities: ['visual', 'auditory', 'sensorimotor'] },
            attention: { type: 'divided', cognitiveLoad: 75, switchingCost: 50 },
            learning: { type: 'self-supervised', autonomousSkillAcquisition: true, catastrophicFailureProtection: true },
            decisionMaking: { type: 'hybrid', reasoningLevel: 'neuro-symbolic', explanationCapability: true }
          }
        }
      }
    }
  ];

  // Local installed plugins
  const installedPlugins = [
    {
      id: 'basic-webhook',
      name: 'Basic Webhook',
      description: 'Simple webhook integration for basic use cases',
      category: 'integration',
      version: '1.0.0',
      author: 'ADK Team',
      status: 'installed',
      enabled: true,
      configuration: {
        url: '',
        method: 'POST',
        headers: {},
        timeout: 30
      },
      installedAt: '2025-12-14T10:00:00Z',
      lastUsed: '2025-12-14T12:00:00Z',
      usageCount: 25
    },
    {
      id: 'custom-nodes',
      name: 'Custom Workflow Nodes',
      description: 'Collection of custom workflow node types',
      category: 'workflow',
      version: '2.1.0',
      author: 'CustomDev',
      status: 'installed',
      enabled: true,
      configuration: {
        nodeTypes: ['custom_processor', 'data_transformer'],
        defaultSettings: {}
      },
      installedAt: '2025-12-13T15:30:00Z',
      lastUsed: '2025-12-14T11:45:00Z',
      usageCount: 67
    }
  ];

  const filteredPlugins = $derived(
    [...installedPlugins, ...marketplacePlugins].filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      
      const pluginStatus = plugin.status || (installedPlugins.find(p => p.id === plugin.id) ? 'installed' : 'available');
      const matchesStatus = selectedStatus === 'all' || pluginStatus === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
  );

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.icon : Puzzle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-success';
      case 'available': return 'text-primary-500';
      case 'development': return 'text-warning';
      case 'disabled': return 'text-text-medium';
      default: return 'text-text-medium';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return CheckCircle2;
      case 'available': return Download;
      case 'development': return Code;
      case 'disabled': return XCircle;
      default: return Package;
    }
  };

  const installPlugin = async (plugin: any) => {
    isLoading = true;
    
    try {
      // Simulate plugin installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      storeActions.addSuccess(`Plugin "${plugin.name}" installed successfully`);
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError(`Failed to install plugin: ${error}`);
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    const plugin = installedPlugins.find(p => p.id === pluginId);
    if (plugin && confirm(`Are you sure you want to uninstall "${plugin.name}"?`)) {
      isLoading = true;
      
      try {
        // Simulate plugin uninstallation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        storeActions.addSuccess(`Plugin "${plugin.name}" uninstalled successfully`);
        setTimeout(() => storeActions.removeSuccess(-1), 3000);
        
      } catch (error) {
        storeActions.addError(`Failed to uninstall plugin: ${error}`);
        setTimeout(() => storeActions.removeError(-1), 3000);
      } finally {
        isLoading = false;
      }
    }
  };

  const togglePlugin = async (pluginId: string) => {
    const plugin = installedPlugins.find(p => p.id === pluginId);
    if (plugin) {
      const newStatus = !plugin.enabled;
      
      try {
        // Simulate plugin toggle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        plugin.enabled = newStatus;
        storeActions.addSuccess(`Plugin "${plugin.name}" ${newStatus ? 'enabled' : 'disabled'}`);
        setTimeout(() => storeActions.removeSuccess(-1), 3000);
        
      } catch (error) {
        storeActions.addError(`Failed to ${newStatus ? 'enable' : 'disable'} plugin: ${error}`);
        setTimeout(() => storeActions.removeError(-1), 3000);
      }
    }
  };

  const createPlugin = async () => {
    if (!pluginName.trim() || !pluginDescription.trim()) {
      storeActions.addError('Plugin name and description are required');
      return;
    }

    isLoading = true;
    
    try {
      const newPlugin = {
        id: `plugin-${Date.now()}`,
        name: pluginName,
        description: pluginDescription,
        category: pluginCategory,
        version: pluginVersion,
        author: pluginAuthor,
        license: pluginLicense,
        status: 'development',
        enabled: false,
        configuration: pluginConfigForm,
        code: pluginCode,
        tests: pluginTests,
        createdAt: new Date().toISOString(),
        dependencies: pluginDependencies.split(',').map(d => d.trim()).filter(d => d)
      };

      // Add to development plugins
      installedPlugins.push(newPlugin);
      
      storeActions.addSuccess(`Plugin "${pluginName}" created in development mode`);
      
      // Reset form
      resetPluginForm();
      showCreateModal = false;
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to create plugin');
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const resetPluginForm = () => {
    pluginName = '';
    pluginDescription = '';
    pluginCategory = 'workflow';
    pluginVersion = '1.0.0';
    pluginAuthor = '';
    pluginLicense = 'MIT';
    pluginDependencies = '';
    pluginConfig = '';
    pluginCode = '';
    pluginTests = '';
    pluginConfigForm = {};
  };

  const exportPlugin = (plugin: any) => {
    const exportData = {
      plugin,
      exportedAt: new Date().toISOString(),
      platform: 'Google ADK Agent Platform',
      version: '2.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plugin.name.toLowerCase().replace(/\s+/g, '-')}-plugin.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewPluginDetails = (plugin: any) => {
    selectedPlugin = plugin;
    if (plugin.configuration) {
      pluginConfigForm = { ...plugin.configuration };
    }
    showDetailsModal = true;
  };

  const importPlugin = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pluginData = JSON.parse(e.target?.result as string);
        
        if (pluginData.plugin) {
          installedPlugins.push({
            ...pluginData.plugin,
            id: `imported-${Date.now()}`,
            status: 'installed',
            importedAt: new Date().toISOString()
          });
          
          storeActions.addSuccess('Plugin imported successfully');
          setTimeout(() => storeActions.removeSuccess(-1), 3000);
        } else {
          throw new Error('Invalid plugin file format');
        }
        
      } catch (error) {
        storeActions.addError('Failed to import plugin - invalid file format');
        setTimeout(() => storeActions.removeError(-1), 3000);
      }
    };
    
    reader.readAsText(file);
    input.value = '';
  };

  onMount(() => {
    // Load plugins from store
  });
</script>

<svelte:head>
  <title>Plugin System - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
    <div>
      <h1 class="text-heading text-text-high">Plugin System</h1>
      <p class="text-small text-text-medium">Extend your platform with plugins and integrations</p>
    </div>
    
    <div class="flex items-center space-x-3">
      <label class="btn-secondary text-sm cursor-pointer">
        <input
          type="file"
          accept=".json"
          on:change={importPlugin}
          class="hidden"
        />
        <Upload class="w-4 h-4 mr-2" />
        Import Plugin
      </label>
      
      <button
        onclick={() => developmentMode = !developmentMode}
        class="btn-secondary text-sm {developmentMode ? 'bg-warning/20 text-warning' : ''}"
      >
        <Code class="w-4 h-4 mr-2" />
        {developmentMode ? 'Development Mode' : 'Browse Marketplace'}
      </button>
      
      <button
        onclick={() => showCreateModal = true}
        class="btn-primary text-sm"
      >
        <Plus class="w-4 h-4 mr-2" />
        Create Plugin
      </button>
    </div>
  </div>

  <!-- Controls -->
  <div class="bg-surface-1 border-b border-border px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Search and Filters -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-medium" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search plugins..."
            class="form-input pl-10 w-64"
          />
        </div>
        
        <select bind:value={selectedCategory} class="form-select">
          {#each categories as category}
            <option value={category.value}>{category.label}</option>
          {/each}
        </select>
        
        <select bind:value={selectedStatus} class="form-select">
          {#each statuses as status}
            <option value={status.value}>{status.label}</option>
          {/each}
        </select>
      </div>

      <!-- Stats -->
      <div class="flex items-center space-x-6 text-small text-text-medium">
        <div class="flex items-center space-x-2">
          <Package class="w-4 h-4 text-primary-500" />
          <span>{installedPlugins.length} Installed</span>
        </div>
        <div class="flex items-center space-x-2">
          <Download class="w-4 h-4 text-success" />
          <span>{marketplacePlugins.length} Available</span>
        </div>
        <div class="flex items-center space-x-2">
          <Star class="w-4 h-4 text-warning" />
          <span>4.7★ Average Rating</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Plugin Grid -->
  <div class="flex-1 overflow-auto p-6">
    {#if filteredPlugins.length === 0}
      <div class="flex items-center justify-center h-full text-center">
        <div>
          <Package class="w-12 h-12 text-text-medium mx-auto mb-4" />
          <h3 class="text-heading text-text-high mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'No plugins found' : 'No plugins installed'}
          </h3>
          <p class="text-body text-text-medium mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'Browse the marketplace or create your first plugin'}
          </p>
          <div class="space-x-3">
            <button
              onclick={() => showMarketplaceModal = true}
              class="btn-primary"
            >
              <Globe class="w-4 h-4 mr-2" />
              Browse Marketplace
            </button>
            <button
              onclick={() => showCreateModal = true}
              class="btn-secondary"
            >
              <Plus class="w-4 h-4 mr-2" />
              Create Plugin
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredPlugins as plugin (plugin.id)}
          {@const CategoryIcon = getCategoryIcon(plugin.category)}
          {@const StatusIcon = getStatusIcon(plugin.status || 'available')}
          {@const statusColor = getStatusColor(plugin.status || 'available')}
          
          <div class="bg-surface-card border border-border rounded-sharp overflow-hidden hover:border-primary-500 transition-colors">
            <!-- Plugin Header -->
            <div class="p-6 border-b border-border">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center">
                    <svelte:component this={CategoryIcon} class="w-5 h-5 text-primary-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-body font-medium text-text-high truncate">{plugin.name}</h3>
                    <p class="text-small text-text-medium">v{plugin.version} by {plugin.author}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <svelte:component this={StatusIcon} class="w-4 h-4 {statusColor}" />
                  {#if plugin.rating}
                    <div class="flex items-center space-x-1">
                      <Star class="w-3 h-3 text-warning fill-current" />
                      <span class="text-small text-text-high">{plugin.rating}</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              <p class="text-small text-text-medium mb-3 line-clamp-2">{plugin.description}</p>
              
              <!-- Plugin Stats -->
              <div class="flex items-center justify-between text-small text-text-medium">
                <div class="flex items-center space-x-4">
                  {#if plugin.downloads}
                    <div class="flex items-center space-x-1">
                      <Download class="w-3 h-3" />
                      <span>{plugin.downloads}</span>
                    </div>
                  {/if}
                  {#if plugin.price}
                    <span class="text-success font-medium">{plugin.price}</span>
                  {/if}
                  {#if plugin.usageCount}
                    <div class="flex items-center space-x-1">
                      <BarChart3 class="w-3 h-3" />
                      <span>{plugin.usageCount} uses</span>
                    </div>
                  {/if}
                </div>
                
                <span class="capitalize {statusColor}">{plugin.status || 'available'}</span>
              </div>
            </div>

            <!-- Tags -->
            {#if plugin.tags}
              <div class="px-6 py-3 border-b border-border">
                <div class="flex flex-wrap gap-1">
                  {#each plugin.tags.slice(0, 4) as tag}
                    <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                      {tag}
                    </span>
                  {/each}
                  {#if plugin.tags.length > 4}
                    <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-medium">
                      +{plugin.tags.length - 4} more
                    </span>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Actions -->
            <div class="px-6 py-4">
              <div class="flex space-x-2">
                {#if plugin.status === 'installed'}
                  <button
                    onclick={() => togglePlugin(plugin.id)}
                    class="btn-secondary text-sm flex-1"
                  >
                    {#if plugin.enabled}
                      <Pause class="w-4 h-4 mr-2" />
                      Disable
                    {:else}
                      <Play class="w-4 h-4 mr-2" />
                      Enable
                    {/if}
                  </button>
                {:else if plugin.status === 'available'}
                  <button
                    onclick={() => installPlugin(plugin)}
                    disabled={isLoading}
                    class="btn-primary text-sm flex-1 {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                  >
                    {#if isLoading}
                      <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
                      Installing...
                    {:else}
                      <Download class="w-4 h-4 mr-2" />
                      Install
                    {/if}
                  </button>
                {:else}
                  <button
                    onclick={() => viewPluginDetails(plugin)}
                    class="btn-secondary text-sm flex-1"
                  >
                    <Eye class="w-4 h-4 mr-2" />
                    View
                  </button>
                {/if}
                
                <button
                  onclick={() => viewPluginDetails(plugin)}
                  class="btn-secondary text-sm"
                  title="Plugin details"
                >
                  <Settings class="w-4 h-4" />
                </button>
                
                <button
                  onclick={() => exportPlugin(plugin)}
                  class="btn-secondary text-sm"
                  title="Export plugin"
                >
                  <Archive class="w-4 h-4" />
                </button>
                
                {#if plugin.status === 'installed'}
                  <button
                    onclick={() => uninstallPlugin(plugin.id)}
                    class="btn-secondary text-sm text-error"
                    title="Uninstall plugin"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Create Plugin Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showCreateModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-4xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Create New Plugin</h2>
        <button onclick={() => showCreateModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-subheading text-text-high">Basic Information</h3>
          
          <div>
            <label class="form-label">Plugin Name</label>
            <input
              type="text"
              bind:value={pluginName}
              class="form-input"
              placeholder="My Custom Plugin"
            />
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea
              bind:value={pluginDescription}
              rows="3"
              class="form-input"
              placeholder="Describe what your plugin does..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Category</label>
              <select bind:value={pluginCategory} class="form-select">
                {#each categories.filter(c => c.value !== 'all') as category}
                  <option value={category.value}>{category.label}</option>
                {/each}
              </select>
            </div>

            <div>
              <label class="form-label">Version</label>
              <input
                type="text"
                bind:value={pluginVersion}
                class="form-input"
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Author</label>
              <input
                type="text"
                bind:value={pluginAuthor}
                class="form-input"
                placeholder="Your name or organization"
              />
            </div>

            <div>
              <label class="form-label">License</label>
              <select bind:value={pluginLicense} class="form-select">
                {#each licenses as license}
                  <option value={license}>{license}</option>
                {/each}
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Dependencies (comma-separated)</label>
            <input
              type="text"
              bind:value={pluginDependencies}
              class="form-input"
              placeholder="lodash, axios, moment"
            />
          </div>
        </div>

        <!-- Plugin Code -->
        <div class="space-y-4">
          <h3 class="text-subheading text-text-high">Plugin Code</h3>
          
          <div>
            <label class="form-label">Plugin Configuration (JSON)</label>
            <textarea
              bind:value={pluginConfig}
              rows="6"
              class="form-input font-mono text-small"
              placeholder='{"setting1": "value1", "setting2": true}'
            ></textarea>
          </div>

          <div>
            <label class="form-label">Plugin Code (JavaScript)</label>
            <textarea
              bind:value={pluginCode}
              rows="8"
              class="form-input font-mono text-small"
              placeholder="export default class MyPlugin {
  constructor(config) {
    this.config = config;
  }
  
  async execute(context) {
    // Plugin logic here
    return { result: 'success' };
  }
}"
            ></textarea>
          </div>

          <div>
            <label class="form-label">Test Cases (JSON)</label>
            <textarea
              bind:value={pluginTests}
              rows="4"
              class="form-input font-mono text-small"
              placeholder='[{"input": "test1", "expected": "result1"}]'
            ></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showCreateModal = false}
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          onclick={createPlugin}
          disabled={isLoading}
          class="btn-primary {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
        >
          {#if isLoading}
            <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
            Creating...
          {:else}
            <Plus class="w-4 h-4 mr-2" />
            Create Plugin
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Plugin Details Modal -->
{#if showDetailsModal && selectedPlugin}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showDetailsModal = false}>
    <div class="bg-surface-card border border-border rounded-sharp p-6 w-full max-w-6xl max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-heading text-text-high">Plugin Details: {selectedPlugin.name}</h2>
        <button onclick={() => showDetailsModal = false} class="btn-secondary p-2">
          <XCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Plugin Information -->
        <div class="lg:col-span-2 space-y-6">
          <div>
            <h3 class="text-subheading text-text-high mb-3">Description</h3>
            <p class="text-body text-text-medium">{selectedPlugin.description}</p>
          </div>

          {#if selectedPlugin.features}
            <div>
              <h3 class="text-subheading text-text-high mb-3">Features</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                {#each selectedPlugin.features as feature}
                  <div class="flex items-center space-x-2">
                    <CheckCircle2 class="w-4 h-4 text-success" />
                    <span class="text-body text-text-high">{feature}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Integral AI Capabilities -->
          {#if selectedPlugin.integralAICapabilities}
            <div>
              <h3 class="text-subheading text-text-high mb-3 flex items-center space-x-2">
                <Brain class="w-5 h-5 text-primary-500" />
                <span>Integral AI Capabilities</span>
              </h3>
              
              <div class="space-y-4">
                <!-- Core Principles -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {#if selectedPlugin.integralAICapabilities.autonomousSkillLearning}
                    <div class="bg-surface-2 border border-border rounded-sharp p-4">
                      <div class="flex items-center space-x-2 mb-2">
                        <Zap class="w-4 h-4 text-primary-500" />
                        <h4 class="text-small font-semibold text-text-high">Autonomous Skill Learning</h4>
                      </div>
                      <p class="text-small text-text-medium mb-2">Learns new skills without human intervention</p>
                      <div class="space-y-1 text-small">
                        <div class="flex justify-between">
                          <span class="text-text-medium">Learning Rate:</span>
                          <span class="text-text-high">{selectedPlugin.integralAICapabilities.autonomousSkillLearning.learningRate}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Success Rate:</span>
                          <span class="text-text-high">{selectedPlugin.integralAICapabilities.autonomousSkillLearning.successRate}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Human Intervention:</span>
                          <span class="text-error">{selectedPlugin.integralAICapabilities.autonomousSkillLearning.interventionRequired ? 'Required' : 'None'}</span>
                        </div>
                      </div>
                    </div>
                  {/if}

                  {#if selectedPlugin.integralAICapabilities.safeReliableMastery}
                    <div class="bg-surface-2 border border-border rounded-sharp p-4">
                      <div class="flex items-center space-x-2 mb-2">
                        <Shield class="w-4 h-4 text-success" />
                        <h4 class="text-small font-semibold text-text-high">Safe & Reliable Mastery</h4>
                      </div>
                      <p class="text-small text-text-medium mb-2">Learns without catastrophic failures</p>
                      <div class="space-y-1 text-small">
                        <div class="flex justify-between">
                          <span class="text-text-medium">Failure Rate:</span>
                          <span class="text-text-high">{(selectedPlugin.integralAICapabilities.safeReliableMastery.failureRate * 100).toFixed(1)}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Safety Constraints:</span>
                          <span class="text-text-high">{selectedPlugin.integralAICapabilities.safeReliableMastery.safetyConstraints}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Catastrophic Failures:</span>
                          <span class="text-success">{selectedPlugin.integralAICapabilities.safeReliableMastery.catastrophicFailures}</span>
                        </div>
                      </div>
                    </div>
                  {/if}

                  {#if selectedPlugin.integralAICapabilities.energyEfficiency}
                    <div class="bg-surface-2 border border-border rounded-sharp p-4">
                      <div class="flex items-center space-x-2 mb-2">
                        <Cpu class="w-4 h-4 text-warning" />
                        <h4 class="text-small font-semibold text-text-high">Energy Efficiency</h4>
                      </div>
                      <p class="text-small text-text-medium mb-2">Uses energy comparable to human brain</p>
                      <div class="space-y-1 text-small">
                        <div class="flex justify-between">
                          <span class="text-text-medium">Power Consumption:</span>
                          <span class="text-text-high">{selectedPlugin.integralAICapabilities.energyEfficiency.energyConsumption}W</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Efficiency Ratio:</span>
                          <span class="text-text-high">{(selectedPlugin.integralAICapabilities.energyEfficiency.efficiencyRatio * 100).toFixed(0)}%</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-medium">Optimization:</span>
                          <span class="text-text-high capitalize">{selectedPlugin.integralAICapabilities.energyEfficiency.optimization}</span>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Universal Simulators -->
                {#if selectedPlugin.integralAICapabilities.universalSimulators}
                  <div class="bg-surface-2 border border-border rounded-sharp p-4">
                    <h4 class="text-small font-semibold text-text-high mb-3 flex items-center space-x-2">
                      <Globe class="w-4 h-4 text-primary-500" />
                      <span>Universal Simulators (World Models)</span>
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {#each selectedPlugin.integralAICapabilities.universalSimulators as simulator}
                        <div class="bg-surface-1 border border-border rounded-sharp p-3">
                          <h5 class="text-small font-medium text-text-high mb-1">{simulator.name}</h5>
                          <p class="text-tiny text-text-medium capitalize mb-2">{simulator.type}</p>
                          <div class="flex flex-wrap gap-1 mb-2">
                            {#each simulator.capabilities as capability}
                              <span class="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-tiny rounded">
                                {capability.replace('_', ' ')}
                              </span>
                            {/each}
                          </div>
                          <div class="flex justify-between text-tiny">
                            <span class="text-text-medium">Learning Rate:</span>
                            <span class="text-text-high">{(simulator.learningRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Universal Operators -->
                {#if selectedPlugin.integralAICapabilities.universalOperators}
                  <div class="bg-surface-2 border border-border rounded-sharp p-4">
                    <h4 class="text-small font-semibold text-text-high mb-3 flex items-center space-x-2">
                      <Bot class="w-4 h-4 text-success" />
                      <span>Universal Operators (Agency Layer)</span>
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {#each selectedPlugin.integralAICapabilities.universalOperators as operator}
                        <div class="bg-surface-1 border border-border rounded-sharp p-3">
                          <h5 class="text-small font-medium text-text-high mb-1">{operator.name}</h5>
                          <p class="text-tiny text-text-medium capitalize mb-2">{operator.layer} Layer</p>
                          <div class="flex flex-wrap gap-1 mb-2">
                            {#each operator.capabilities as capability}
                              <span class="px-1.5 py-0.5 bg-success/20 text-success text-tiny rounded">
                                {capability.replace('_', ' ')}
                              </span>
                            {/each}
                          </div>
                          <div class="flex items-center justify-between text-tiny">
                            <span class="text-text-medium">Autonomous:</span>
                            <span class={operator.autonomousLearning ? 'text-success' : 'text-error'}>
                              {operator.autonomousLearning ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Neocortex Mimicry -->
                {#if selectedPlugin.integralAICapabilities.neocortexMimicry}
                  <div class="bg-surface-2 border border-border rounded-sharp p-4">
                    <h4 class="text-small font-semibold text-text-high mb-3 flex items-center space-x-2">
                      <Brain class="w-4 h-4 text-warning" />
                      <span>Neocortex Simulation</span>
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Cortical Layers -->
                      <div>
                        <h5 class="text-small font-medium text-text-high mb-2">Cortical Layers</h5>
                        <div class="space-y-2">
                          {#each selectedPlugin.integralAICapabilities.neocortexMimicry.corticalLayers as layer}
                            <div class="flex justify-between items-center bg-surface-1 border border-border rounded p-2">
                              <span class="text-small text-text-medium">{layer.name}</span>
                              <div class="flex items-center space-x-2 text-tiny">
                                <span class="text-text-high">{(layer.neuronCount / 1000).toFixed(0)}K</span>
                                <span class="text-text-medium">neurons</span>
                                <span class="text-text-high">•</span>
                                <span class="text-text-high">{(layer.plasticity * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <!-- Synaptic Plasticity -->
                      <div>
                        <h5 class="text-small font-medium text-text-high mb-2">Synaptic Plasticity</h5>
                        <div class="space-y-2">
                          <div class="flex justify-between text-tiny">
                            <span class="text-text-medium">LTP:</span>
                            <span class="text-text-high">{(selectedPlugin.integralAICapabilities.neocortexMimicry.synapticPlasticity.longTermPotentiation * 100).toFixed(0)}%</span>
                          </div>
                          <div class="flex justify-between text-tiny">
                            <span class="text-text-medium">LTD:</span>
                            <span class="text-text-high">{(selectedPlugin.integralAICapabilities.neocortexMimicry.synapticPlasticity.longTermDepression * 100).toFixed(0)}%</span>
                          </div>
                          <div class="flex justify-between text-tiny">
                            <span class="text-text-medium">Spike Timing:</span>
                            <span class="text-text-high">{(selectedPlugin.integralAICapabilities.neocortexMimicry.synapticPlasticity.spikeTiming * 100).toFixed(0)}%</span>
                          </div>
                          <div class="flex justify-between text-tiny">
                            <span class="text-text-medium">Metaplasticity:</span>
                            <span class="text-text-high">{(selectedPlugin.integralAICapabilities.neocortexMimicry.synapticPlasticity.metaplasticity * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          {#if selectedPlugin.screenshots}
            <div>
              <h3 class="text-subheading text-text-high mb-3">Screenshots</h3>
              <div class="grid grid-cols-2 gap-3">
                {#each selectedPlugin.screenshots as screenshot}
                  <div class="bg-surface-2 border border-border rounded-sharp p-4 text-center">
                    <FileText class="w-8 h-8 text-text-medium mx-auto mb-2" />
                    <div class="text-small text-text-high">{screenshot}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Plugin Code (for development plugins) -->
          {#if selectedPlugin.status === 'development' && selectedPlugin.code}
            <div>
              <h3 class="text-subheading text-text-high mb-3">Plugin Code</h3>
              <pre class="bg-surface-2 p-4 rounded-sharp overflow-x-auto text-small text-text-high">
                <code>{selectedPlugin.code}</code>
              </pre>
            </div>
          {/if}
        </div>

        <!-- Configuration Panel -->
        <div class="space-y-6">
          <!-- Plugin Info -->
          <div class="bg-surface-2 p-4 rounded-sharp border border-border">
            <h3 class="text-subheading text-text-high mb-3">Plugin Info</h3>
            <div class="space-y-2 text-small">
              <div class="flex justify-between">
                <span class="text-text-medium">Version:</span>
                <span class="text-text-high font-mono">{selectedPlugin.version}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-medium">Author:</span>
                <span class="text-text-high">{selectedPlugin.author}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-medium">Category:</span>
                <span class="text-text-high capitalize">{selectedPlugin.category}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-medium">Status:</span>
                <span class="text-text-high capitalize {getStatusColor(selectedPlugin.status || 'available')}">
                  {selectedPlugin.status || 'available'}
                </span>
              </div>
              {#if selectedPlugin.downloads}
                <div class="flex justify-between">
                  <span class="text-text-medium">Downloads:</span>
                  <span class="text-text-high font-mono">{selectedPlugin.downloads}</span>
                </div>
              {/if}
              {#if selectedPlugin.rating}
                <div class="flex justify-between">
                  <span class="text-text-medium">Rating:</span>
                  <div class="flex items-center space-x-1">
                    <Star class="w-3 h-3 text-warning fill-current" />
                    <span class="text-text-high">{selectedPlugin.rating}</span>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Plugin Configuration -->
          {#if selectedPlugin.status === 'installed'}
            <div class="bg-surface-2 p-4 rounded-sharp border border-border">
              <h3 class="text-subheading text-text-high mb-3">Configuration</h3>
              <div class="space-y-3">
                {#each Object.entries(pluginConfigForm) as [key, value]}
                  <div>
                    <label class="text-small text-text-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
                    <input
                      type="text"
                      bind:value={pluginConfigForm[key]}
                      class="form-input text-small"
                      placeholder="Configuration value"
                    />
                  </div>
                {/each}
                
                <button class="btn-primary w-full text-sm">
                  <Settings class="w-4 h-4 mr-2" />
                  Save Configuration
                </button>
              </div>
            </div>
          {/if}

          <!-- Usage Statistics -->
          {#if selectedPlugin.usageCount}
            <div class="bg-surface-2 p-4 rounded-sharp border border-border">
              <h3 class="text-subheading text-text-high mb-3">Usage</h3>
              <div class="space-y-2 text-small">
                <div class="flex justify-between">
                  <span class="text-text-medium">Total Uses:</span>
                  <span class="text-text-high font-mono">{selectedPlugin.usageCount}</span>
                </div>
                {#if selectedPlugin.lastUsed}
                  <div class="flex justify-between">
                    <span class="text-text-medium">Last Used:</span>
                    <span class="text-text-high">{new Date(selectedPlugin.lastUsed).toLocaleDateString()}</span>
                  </div>
                {/if}
                {#if selectedPlugin.installedAt}
                  <div class="flex justify-between">
                    <span class="text-text-medium">Installed:</span>
                    <span class="text-text-high">{new Date(selectedPlugin.installedAt).toLocaleDateString()}</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showDetailsModal = false}
          class="btn-secondary"
        >
          Close
        </button>
        
        {#if selectedPlugin.status === 'available'}
          <button
            onclick={() => installPlugin(selectedPlugin)}
            class="btn-primary"
          >
            <Download class="w-4 h-4 mr-2" />
            Install Plugin
          </button>
        {:else if selectedPlugin.status === 'installed'}
          <button
            onclick={() => togglePlugin(selectedPlugin.id)}
            class="btn-primary"
          >
            {#if selectedPlugin.enabled}
              <Pause class="w-4 h-4 mr-2" />
              Disable
            {:else}
              <Play class="w-4 h-4 mr-2" />
              Enable
            {/if}
          </button>
        {/if}
        
        <button
          onclick={() => exportPlugin(selectedPlugin)}
          class="btn-secondary"
        >
          <Archive class="w-4 h-4 mr-2" />
          Export
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom styles for plugin system */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>