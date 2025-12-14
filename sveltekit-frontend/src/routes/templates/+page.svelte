<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    storeActions,
    workflows
  } from '$stores';
  import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Star, 
    Clock, 
    Users, 
    MessageSquare, 
    Code, 
    Database, 
    ShoppingCart, 
    FileText, 
    Mail, 
    Calendar, 
    BarChart3, 
    Shield, 
    Zap, 
    ArrowRight,
    Eye,
    GitBranch,
    RefreshCw
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let selectedDifficulty = $state('all');
  let isLoading = $state(false);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Zap },
    { value: 'customer-support', label: 'Customer Support', icon: Users },
    { value: 'data-processing', label: 'Data Processing', icon: Database },
    { value: 'content-creation', label: 'Content Creation', icon: FileText },
    { value: 'e-commerce', label: 'E-commerce', icon: ShoppingCart },
    { value: 'communication', label: 'Communication', icon: Mail },
    { value: 'automation', label: 'Automation', icon: GitBranch },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'coding', label: 'Code Assistant', icon: Code }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Template library
  const workflowTemplates = [
    {
      id: 'customer-support-basic',
      name: 'Customer Support Bot',
      description: 'Automated customer support with ticket routing and escalation',
      category: 'customer-support',
      difficulty: 'beginner',
      rating: 4.8,
      downloads: 1250,
      estimatedTime: '15 minutes',
      nodeCount: 8,
      author: 'ADK Team',
      tags: ['chat', 'routing', 'escalation'],
      preview: {
        nodes: [
          { type: 'input', label: 'Customer Query', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Intent Analysis', position: { x: 300, y: 100 } },
          { type: 'conditional', label: 'Route to Department', position: { x: 500, y: 100 } },
          { type: 'model', label: 'Generate Response', position: { x: 700, y: 100 } },
          { type: 'output', label: 'Send Response', position: { x: 900, y: 100 } }
        ],
        connections: 4
      },
      features: [
        'Intent recognition and classification',
        'Automatic department routing',
        'Response generation',
        'Escalation to human agents'
      ]
    },
    {
      id: 'data-pipeline',
      name: 'Data Processing Pipeline',
      description: 'Automated data ingestion, transformation, and analysis workflow',
      category: 'data-processing',
      difficulty: 'intermediate',
      rating: 4.6,
      downloads: 890,
      estimatedTime: '30 minutes',
      nodeCount: 12,
      author: 'ADK Team',
      tags: ['data', 'etl', 'analytics'],
      preview: {
        nodes: [
          { type: 'input', label: 'Data Source', position: { x: 100, y: 100 } },
          { type: 'tool', label: 'Extract Data', position: { x: 300, y: 100 } },
          { type: 'tool', label: 'Transform', position: { x: 500, y: 100 } },
          { type: 'tool', label: 'Validate', position: { x: 700, y: 100 } },
          { type: 'output', label: 'Store Results', position: { x: 900, y: 100 } }
        ],
        connections: 4
      },
      features: [
        'Multi-source data extraction',
        'Data validation and cleaning',
        'Automated transformations',
        'Error handling and logging'
      ]
    },
    {
      id: 'content-generator',
      name: 'Content Generation Assistant',
      description: 'AI-powered content creation with style and tone customization',
      category: 'content-creation',
      difficulty: 'beginner',
      rating: 4.7,
      downloads: 2100,
      estimatedTime: '10 minutes',
      nodeCount: 6,
      author: 'ADK Team',
      tags: ['content', 'writing', 'ai'],
      preview: {
        nodes: [
          { type: 'input', label: 'Content Request', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Content Generation', position: { x: 300, y: 100 } },
          { type: 'tool', label: 'Style Check', position: { x: 500, y: 100 } },
          { type: 'output', label: 'Final Content', position: { x: 700, y: 100 } }
        ],
        connections: 3
      },
      features: [
        'Multiple content formats',
        'Style and tone customization',
        'SEO optimization',
        'Quality validation'
      ]
    },
    {
      id: 'ecommerce-assistant',
      name: 'E-commerce Product Assistant',
      description: 'Product recommendation engine with inventory management',
      category: 'e-commerce',
      difficulty: 'intermediate',
      rating: 4.5,
      downloads: 756,
      estimatedTime: '25 minutes',
      nodeCount: 10,
      author: 'ADK Team',
      tags: ['recommendations', 'inventory', 'sales'],
      preview: {
        nodes: [
          { type: 'input', label: 'User Request', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Analyze Preferences', position: { x: 300, y: 100 } },
          { type: 'tool', label: 'Check Inventory', position: { x: 500, y: 100 } },
          { type: 'model', label: 'Generate Recommendations', position: { x: 700, y: 100 } },
          { type: 'output', label: 'Product List', position: { x: 900, y: 100 } }
        ],
        connections: 4
      },
      features: [
        'Personalized recommendations',
        'Inventory awareness',
        'Price optimization',
        'Sales analytics'
      ]
    },
    {
      id: 'code-assistant',
      name: 'AI Code Assistant',
      description: 'Intelligent coding helper with testing and documentation',
      category: 'coding',
      difficulty: 'advanced',
      rating: 4.9,
      downloads: 1890,
      estimatedTime: '45 minutes',
      nodeCount: 15,
      author: 'ADK Team',
      tags: ['coding', 'testing', 'documentation'],
      preview: {
        nodes: [
          { type: 'input', label: 'Code Request', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Generate Code', position: { x: 300, y: 100 } },
          { type: 'tool', label: 'Run Tests', position: { x: 500, y: 100 } },
          { type: 'conditional', label: 'Tests Pass?', position: { x: 700, y: 100 } },
          { type: 'tool', label: 'Generate Docs', position: { x: 900, y: 100 } },
          { type: 'output', label: 'Final Output', position: { x: 1100, y: 100 } }
        ],
        connections: 5
      },
      features: [
        'Multi-language support',
        'Automated testing',
        'Documentation generation',
        'Code review and optimization'
      ]
    },
    {
      id: 'email-automation',
      name: 'Email Marketing Automation',
      description: 'Personalized email campaigns with A/B testing',
      category: 'communication',
      difficulty: 'intermediate',
      rating: 4.4,
      downloads: 634,
      estimatedTime: '20 minutes',
      nodeCount: 9,
      author: 'ADK Team',
      tags: ['email', 'marketing', 'automation'],
      preview: {
        nodes: [
          { type: 'input', label: 'Campaign Trigger', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Segment Audience', position: { x: 300, y: 100 } },
          { type: 'tool', label: 'A/B Test', position: { x: 500, y: 100 } },
          { type: 'model', label: 'Personalize Content', position: { x: 700, y: 100 } },
          { type: 'output', label: 'Send Emails', position: { x: 900, y: 100 } }
        ],
        connections: 4
      },
      features: [
        'Audience segmentation',
        'A/B testing',
        'Personalization',
        'Performance tracking'
      ]
    },
    {
      id: 'security-monitor',
      name: 'Security Monitoring System',
      description: 'Real-time security threat detection and response',
      category: 'security',
      difficulty: 'advanced',
      rating: 4.3,
      downloads: 445,
      estimatedTime: '60 minutes',
      nodeCount: 18,
      author: 'ADK Team',
      tags: ['security', 'monitoring', 'threats'],
      preview: {
        nodes: [
          { type: 'input', label: 'Log Input', position: { x: 100, y: 100 } },
          { type: 'model', label: 'Threat Analysis', position: { x: 300, y: 100 } },
          { type: 'conditional', label: 'Threat Level?', position: { x: 500, y: 100 } },
          { type: 'tool', label: 'Alert System', position: { x: 700, y: 100 } },
          { type: 'tool', label: 'Response Action', position: { x: 900, y: 100 } },
          { type: 'output', label: 'Security Report', position: { x: 1100, y: 100 } }
        ],
        connections: 5
      },
      features: [
        'Real-time threat detection',
        'Automated responses',
        'Compliance reporting',
        'Incident management'
      ]
    },
    {
      id: 'analytics-dashboard',
      name: 'Business Analytics Dashboard',
      description: 'Automated business intelligence and reporting system',
      category: 'analytics',
      difficulty: 'intermediate',
      rating: 4.6,
      downloads: 1120,
      estimatedTime: '35 minutes',
      nodeCount: 11,
      author: 'ADK Team',
      tags: ['analytics', 'reporting', 'bi'],
      preview: {
        nodes: [
          { type: 'input', label: 'Data Sources', position: { x: 100, y: 100 } },
          { type: 'tool', label: 'Aggregate Data', position: { x: 300, y: 100 } },
          { type: 'model', label: 'Generate Insights', position: { x: 500, y: 100 } },
          { type: 'tool', label: 'Create Charts', position: { x: 700, y: 100 } },
          { type: 'output', label: 'Dashboard', position: { x: 900, y: 100 } }
        ],
        connections: 4
      },
      features: [
        'Multi-source data integration',
        'Automated insights generation',
        'Interactive visualizations',
        'Scheduled reporting'
      ]
    }
  ];

  const filteredTemplates = $derived(
    workflowTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
  );

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.icon : Zap;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-error';
      default: return 'text-text-medium';
    }
  };

  const loadTemplate = async (template: any) => {
    isLoading = true;
    
    try {
      // Convert template to workflow format
      const workflow = {
        id: `workflow-${Date.now()}`,
        name: template.name,
        description: template.description,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: template.preview.nodes.map((node: any, index: number) => ({
          id: `node-${index}`,
          type: node.type,
          position: node.position,
          data: { 
            label: node.label, 
            description: `${node.label} node from ${template.name} template` 
          },
          connections: []
        })),
        connections: []
      };

      // Generate connections based on node sequence
      for (let i = 0; i < workflow.nodes.length - 1; i++) {
        workflow.connections.push({
          id: `conn-${i}`,
          sourceId: `node-${i}`,
          targetId: `node-${i + 1}`
        });
      }

      storeActions.addWorkflow(workflow);
      storeActions.addSuccess(`Template "${template.name}" loaded successfully`);
      
      setTimeout(() => storeActions.removeSuccess(-1), 3000);
      
    } catch (error) {
      storeActions.addError('Failed to load template');
      setTimeout(() => storeActions.removeError(-1), 3000);
    } finally {
      isLoading = false;
    }
  };

  const previewTemplate = (template: any) => {
    // Open preview modal or redirect to preview page
    storeActions.addInfo(`Preview feature coming soon for ${template.name}`);
  };
</script>

<svelte:head>
  <title>Workflow Templates - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
    <div>
      <h1 class="text-heading text-text-high">Workflow Templates</h1>
      <p class="text-small text-text-medium">Pre-built workflows to accelerate your development</p>
    </div>
    
    <div class="flex items-center space-x-3">
      <button class="btn-secondary text-sm">
        <Download class="w-4 h-4 mr-2" />
        Import Template
      </button>
      
      <button class="btn-primary text-sm">
        <Plus class="w-4 h-4 mr-2" />
        Create Custom Template
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
            placeholder="Search templates..."
            class="form-input pl-10 w-64"
          />
        </div>
        
        <select bind:value={selectedCategory} class="form-select">
          {#each categories as category}
            <option value={category.value}>{category.label}</option>
          {/each}
        </select>
        
        <select bind:value={selectedDifficulty} class="form-select">
          {#each difficulties as difficulty}
            <option value={difficulty.value}>{difficulty.label}</option>
          {/each}
        </select>
      </div>

      <!-- Stats -->
      <div class="flex items-center space-x-6 text-small text-text-medium">
        <div class="flex items-center space-x-2">
          <Zap class="w-4 h-4 text-primary-500" />
          <span>{filteredTemplates.length} Templates</span>
        </div>
        <div class="flex items-center space-x-2">
          <Star class="w-4 h-4 text-warning" />
          <span>Average 4.6★ rating</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Templates Grid -->
  <div class="flex-1 overflow-auto p-6">
    {#if filteredTemplates.length === 0}
      <div class="flex items-center justify-center h-full text-center">
        <div>
          <GitBranch class="w-12 h-12 text-text-medium mx-auto mb-4" />
          <h3 class="text-heading text-text-high mb-2">No templates found</h3>
          <p class="text-body text-text-medium mb-4">
            Try adjusting your search criteria or browse all templates
          </p>
          <button
            onclick={() => { searchQuery = ''; selectedCategory = 'all'; selectedDifficulty = 'all'; }}
            class="btn-primary"
          >
            Reset Filters
          </button>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredTemplates as template (template.id)}
          {@const CategoryIcon = getCategoryIcon(template.category)}
          {@const difficultyColor = getDifficultyColor(template.difficulty)}
          
          <div class="bg-surface-card border border-border rounded-sharp overflow-hidden hover:border-primary-500 transition-colors">
            <!-- Template Header -->
            <div class="p-6 border-b border-border">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center">
                    <svelte:component this={CategoryIcon} class="w-5 h-5 text-primary-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-body font-medium text-text-high truncate">{template.name}</h3>
                    <p class="text-small text-text-medium capitalize">{template.difficulty}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1">
                  <Star class="w-4 h-4 text-warning fill-current" />
                  <span class="text-small text-text-high font-medium">{template.rating}</span>
                </div>
              </div>
              
              <p class="text-small text-text-medium mb-3">{template.description}</p>
              
              <!-- Template Stats -->
              <div class="flex items-center justify-between text-small text-text-medium">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-1">
                    <Download class="w-3 h-3" />
                    <span>{template.downloads}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Clock class="w-3 h-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <GitBranch class="w-3 h-3" />
                    <span>{template.nodeCount} nodes</span>
                  </div>
                </div>
                
                <span class={difficultyColor}>{template.difficulty}</span>
              </div>
            </div>

            <!-- Features -->
            <div class="px-6 py-4 border-b border-border">
              <div class="text-small text-text-medium mb-2">Key Features</div>
              <div class="space-y-1">
                {#each template.features.slice(0, 3) as feature}
                  <div class="flex items-center space-x-2">
                    <div class="w-1 h-1 bg-primary-500 rounded-full"></div>
                    <span class="text-small text-text-high">{feature}</span>
                  </div>
                {/each}
                {#if template.features.length > 3}
                  <div class="text-small text-text-medium">+{template.features.length - 3} more features</div>
                {/if}
              </div>
            </div>

            <!-- Tags -->
            <div class="px-6 py-4 border-b border-border">
              <div class="flex flex-wrap gap-1">
                {#each template.tags as tag}
                  <span class="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                    {tag}
                  </span>
                {/each}
              </div>
            </div>

            <!-- Actions -->
            <div class="px-6 py-4">
              <div class="flex space-x-2">
                <button
                  onclick={() => loadTemplate(template)}
                  disabled={isLoading}
                  class="btn-primary flex-1 text-sm {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                >
                  {#if isLoading}
                    <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  {:else}
                    <Plus class="w-4 h-4 mr-2" />
                    Use Template
                  {/if}
                </button>
                
                <button
                  onclick={() => previewTemplate(template)}
                  class="btn-secondary text-sm"
                  title="Preview template"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Template Preview Modal -->
<!-- This would be implemented as a separate component for viewing template details -->

<style>
  /* Custom scrollbar for the templates grid */
  .overflow-auto::-webkit-scrollbar {
    width: 8px;
  }
  
  .overflow-auto::-webkit-scrollbar-track {
    background: var(--surface-2);
    border-radius: 4px;
  }
  
  .overflow-auto::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }
  
  .overflow-auto::-webkit-scrollbar-thumb:hover {
    background: var(--text-medium);
  }
</style>