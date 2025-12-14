<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    workflows, 
    currentWorkflow, 
    workflowNodes, 
    workflowConnections,
    uiState,
    storeActions 
  } from '$stores';
  import { 
    Plus, 
    Save, 
    Play, 
    Settings, 
    Bot,
    MessageSquare,
    Code,
    Zap,
    Globe,
    Terminal,
    GitBranch,
    RotateCcw,
    Trash2,
    Copy
  } from 'lucide-svelte';
  import WorkflowCanvas from '$lib/components/WorkflowCanvas.svelte';
  import NodePalette from '$lib/components/NodePalette.svelte';
  import WorkflowProperties from '$lib/components/WorkflowProperties.svelte';

  let workflowName = $state('New Workflow');
  let workflowDescription = $state('');
  let isExecuting = $state(false);
  let selectedNode = $state<string | null>(null);

  const nodeTypes = [
    {
      type: 'input',
      label: 'Input',
      description: 'User input or trigger',
      icon: MessageSquare,
      color: '#3B82F6',
      category: 'triggers'
    },
    {
      type: 'model',
      label: 'AI Model',
      description: 'Call AI model',
      icon: Bot,
      color: '#8B5CF6',
      category: 'processing'
    },
    {
      type: 'tool',
      label: 'Tool',
      description: 'Execute tool or function',
      icon: Zap,
      color: '#10B981',
      category: 'tools'
    },
    {
      type: 'conditional',
      label: 'Condition',
      description: 'Branch based on condition',
      icon: GitBranch,
      color: '#F59E0B',
      category: 'logic'
    },
    {
      type: 'loop',
      label: 'Loop',
      description: 'Repeat operations',
      icon: RotateCcw,
      color: '#EF4444',
      category: 'logic'
    },
    {
      type: 'output',
      label: 'Output',
      description: 'Return result to user',
      icon: MessageSquare,
      color: '#06B6D4',
      category: 'output'
    }
  ];

  const tools = [
    { id: 'web_search', name: 'Web Search', description: 'Search the internet', icon: Globe },
    { id: 'code_execution', name: 'Code Execution', description: 'Run code snippets', icon: Code },
    { id: 'terminal', name: 'Terminal', description: 'Execute shell commands', icon: Terminal },
  ];

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      storeActions.addError('Workflow name is required');
      return;
    }

    const workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: $workflowNodes,
      connections: $workflowConnections
    };

    storeActions.addWorkflow(workflow);
    storeActions.addError('Workflow saved successfully');
    setTimeout(() => storeActions.removeError(-1), 3000);
  };

  const handleExecuteWorkflow = async () => {
    if ($workflowNodes.length === 0) {
      storeActions.addError('Add nodes to the workflow before executing');
      return;
    }

    isExecuting = true;
    
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      storeActions.addError('Workflow executed successfully');
    } catch (error) {
      storeActions.addError('Workflow execution failed');
    } finally {
      isExecuting = false;
      setTimeout(() => storeActions.removeError(-1), 3000);
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Clear all nodes and connections from the canvas?')) {
      workflowNodes.set([]);
      workflowConnections.set([]);
      selectedNode = null;
    }
  };

  const handleLoadTemplate = (templateName: string) => {
    // Load predefined workflow templates
    const templates = {
      customer_support: {
        name: 'Customer Support Bot',
        description: 'Automated customer support with escalation',
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Customer Query', description: 'Receive customer inquiry' },
            connections: ['model-1']
          },
          {
            id: 'model-1',
            type: 'model',
            position: { x: 300, y: 100 },
            data: { label: 'Analyze Intent', description: 'Understand customer needs' },
            connections: ['conditional-1']
          },
          {
            id: 'conditional-1',
            type: 'conditional',
            position: { x: 500, y: 100 },
            data: { label: 'Complex Issue?', description: 'Check if human escalation needed' },
            connections: ['model-2', 'output-1']
          },
          {
            id: 'model-2',
            type: 'model',
            position: { x: 700, y: 50 },
            data: { label: 'Generate Response', description: 'Create helpful response' },
            connections: ['output-1']
          },
          {
            id: 'output-1',
            type: 'output',
            position: { x: 900, y: 100 },
            data: { label: 'Send Response', description: 'Return answer to customer' },
            connections: []
          }
        ],
        connections: [
          { id: 'conn-1', sourceId: 'input-1', targetId: 'model-1' },
          { id: 'conn-2', sourceId: 'model-1', targetId: 'conditional-1' },
          { id: 'conn-3', sourceId: 'conditional-1', targetId: 'model-2' },
          { id: 'conn-4', sourceId: 'conditional-1', targetId: 'output-1' },
          { id: 'conn-5', sourceId: 'model-2', targetId: 'output-1' }
        ]
      }
    };

    const template = templates[templateName as keyof typeof templates];
    if (template) {
      workflowNodes.set(template.nodes);
      workflowConnections.set(template.connections);
      workflowName = template.name;
      workflowDescription = template.description;
      storeActions.addError(`Loaded ${template.name} template`);
      setTimeout(() => storeActions.removeError(-1), 3000);
    }
  };

  onMount(() => {
    storeActions.setActiveView('builder');
  });
</script>

<svelte:head>
  <title>Workflow Builder - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex">
  <!-- Node Palette (Left Sidebar) -->
  <div class="w-80 bg-surface-1 border-r border-border flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-border">
      <h2 class="text-heading text-text-high mb-2">Node Palette</h2>
      <p class="text-small text-text-medium">Drag nodes to the canvas to build your workflow</p>
    </div>

    <!-- Workflow Actions -->
    <div class="p-4 border-b border-border space-y-3">
      <div class="flex space-x-2">
        <input
          type="text"
          placeholder="Workflow name"
          bind:value={workflowName}
          class="form-input flex-1 text-sm"
        />
        <button
          onclick={handleSaveWorkflow}
          class="btn-secondary p-2"
          title="Save workflow"
        >
          <Save class="w-4 h-4" />
        </button>
      </div>

      <div class="flex space-x-2">
        <button
          onclick={handleExecuteWorkflow}
          disabled={isExecuting || $workflowNodes.length === 0}
          class="btn-primary flex-1 text-sm {isExecuting ? 'opacity-50 cursor-not-allowed' : ''}"
        >
          <Play class="w-4 h-4 mr-2" />
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
        <button
          onclick={handleClearCanvas}
          class="btn-secondary p-2"
          title="Clear canvas"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Templates -->
    <div class="p-4 border-b border-border">
      <h3 class="text-small text-text-medium uppercase tracking-wide mb-3">Templates</h3>
      <div class="space-y-2">
        <button
          onclick={() => handleLoadTemplate('customer_support')}
          class="w-full p-3 bg-surface-card border border-border rounded-sharp text-left hover:border-primary-500 transition-colors"
        >
          <div class="text-body font-medium text-text-high">Customer Support</div>
          <div class="text-small text-text-medium">Automated support bot</div>
        </button>
        <button
          onclick={() => handleLoadTemplate('code_assistant')}
          class="w-full p-3 bg-surface-card border border-border rounded-sharp text-left hover:border-primary-500 transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <div class="text-body font-medium text-text-high">Code Assistant</div>
          <div class="text-small text-text-medium">Coming soon</div>
        </button>
      </div>
    </div>

    <!-- Node Types -->
    <div class="flex-1 overflow-auto">
      {#each ['triggers', 'processing', 'tools', 'logic', 'output'] as category}
        <div class="p-4">
          <h3 class="text-small text-text-medium uppercase tracking-wide mb-3 capitalize">
            {category}
          </h3>
          <div class="space-y-2">
            {#each nodeTypes.filter(node => node.category === category) as nodeType}
              <div
                class="p-3 bg-surface-card border border-border rounded-sharp cursor-grab hover:border-primary-500 transition-colors"
                draggable="true"
                ondragstart={(e) => {
                  e.dataTransfer?.setData('application/json', JSON.stringify({
                    type: nodeType.type,
                    template: nodeType
                  }));
                }}
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-8 h-8 rounded-sharp flex items-center justify-center"
                    style="background-color: {nodeType.color}20"
                  >
                    <svelte:component this={nodeType.icon} class="w-4 h-4" style="color: {nodeType.color}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-body font-medium text-text-high">{nodeType.label}</div>
                    <div class="text-small text-text-medium">{nodeType.description}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Workflow Canvas -->
  <div class="flex-1 flex flex-col">
    <!-- Canvas Header -->
    <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 class="text-heading text-text-high">{workflowName}</h1>
        {#if workflowDescription}
          <p class="text-small text-text-medium">{workflowDescription}</p>
        {/if}
      </div>
      
      <div class="flex items-center space-x-3">
        <div class="text-small text-text-medium">
          {$workflowNodes.length} nodes • {$workflowConnections.length} connections
        </div>
        <button class="btn-secondary text-sm">
          <Settings class="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="flex-1 relative">
      <WorkflowCanvas 
        bind:selectedNode
        nodes={$workflowNodes}
        connections={$workflowConnections}
        on:nodesChange={(e) => workflowNodes.set(e.detail)}
        on:connectionsChange={(e) => workflowConnections.set(e.detail)}
      />
    </div>
  </div>

  <!-- Properties Panel (Right Sidebar) -->
  {#if selectedNode || !$uiState.rightPanelCollapsed}
    <WorkflowProperties 
      bind:selectedNode
      on:close={() => selectedNode = null}
    />
  {/if}
</div>