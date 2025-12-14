import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter,
  Star,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Clock,
  User,
  Tag,
  GitBranch,
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
  RefreshCw
} from 'lucide-react'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  downloads: number
  estimatedTime: string
  nodeCount: number
  author: string
  tags: string[]
  features: string[]
  preview: {
    nodes: Array<{
      type: string
      label: string
      position: { x: number; y: number }
    }>
    connections: number
  }
}

const TemplateGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)

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
  ]

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  // Template library
  const workflowTemplates: WorkflowTemplate[] = [
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
    }
  ]

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue)
    return category ? category.icon : Zap
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-success'
      case 'intermediate': return 'text-warning'
      case 'advanced': return 'text-error'
      default: return 'text-text-medium'
    }
  }

  const loadTemplate = async (template: WorkflowTemplate) => {
    setIsLoading(true)
    
    try {
      // Simulate loading workflow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real implementation, this would navigate to the builder with the template
      // TODO: Implement navigation to builder with template
      
    } catch (error) {
      console.error('Failed to load template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const duplicateTemplate = async (templateId: string) => {
    // Simulate template duplication
    // TODO: Implement template duplication
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }
    // Simulate template deletion
    // TODO: Implement template deletion
  }

  const previewTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
        <div>
          <h1 className="text-heading text-text-high">Workflow Templates</h1>
          <p className="text-small text-text-medium">Pre-built workflows to accelerate your development</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-secondary text-sm">
            <Download className="w-4 h-4 mr-2" />
            Import Template
          </button>
          
          <button className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Template
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface-1 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-medium" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10 w-64"
              />
            </div>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="form-select"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-small text-text-medium">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>{filteredTemplates.length} Templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-warning" />
              <span>Average 4.6★ rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <GitBranch className="w-12 h-12 text-text-medium mx-auto mb-4" />
              <h3 className="text-heading text-text-high mb-2">No templates found</h3>
              <p className="text-body text-text-medium mb-4">
                Try adjusting your search criteria or browse all templates
              </p>
              <button
                onClick={() => { 
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedDifficulty('all')
                }}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category)
              const difficultyColor = getDifficultyColor(template.difficulty)
              
              return (
                <div key={template.id} className="bg-surface-card border border-border rounded-sharp overflow-hidden hover:border-primary-500 transition-colors">
                  {/* Template Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center">
                          <CategoryIcon className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body font-medium text-text-high truncate">{template.name}</h3>
                          <p className="text-small text-text-medium capitalize">{template.difficulty}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-small text-text-high font-medium">{template.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-small text-text-medium mb-3">{template.description}</p>
                    
                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-small text-text-medium">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{template.downloads}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitBranch className="w-3 h-3" />
                          <span>{template.nodeCount} nodes</span>
                        </div>
                      </div>
                      
                      <span className={difficultyColor}>{template.difficulty}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="text-small text-text-medium mb-2">Key Features</div>
                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-primary-500 rounded-full"></div>
                          <span className="text-small text-text-high">{feature}</span>
                        </div>
                      ))}
                      {template.features.length > 3 && (
                        <div className="text-small text-text-medium">+{template.features.length - 3} more features</div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadTemplate(template)}
                        disabled={isLoading}
                        className={`btn-primary flex-1 text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Loading...' : 'Use Template'}
                      </button>
                      
                      <button
                        onClick={() => previewTemplate(template)}
                        className="btn-secondary text-sm"
                        title="Preview template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => duplicateTemplate(template.id)}
                        className="btn-secondary text-sm"
                        title="Duplicate template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      {template.author === 'ADK Team' && (
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="btn-secondary text-sm text-error"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-1 rounded-sharp p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subheading text-text-high">{selectedTemplate.name}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Description</label>
                <p className="text-body text-text-medium">{selectedTemplate.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <p className="text-body text-text-medium capitalize">
                    {categories.find(c => c.value === selectedTemplate.category)?.label}
                  </p>
                </div>
                
                <div>
                  <label className="form-label">Author</label>
                  <p className="text-body text-text-medium">{selectedTemplate.author}</p>
                </div>
              </div>
              
              <div>
                <label className="form-label">Features</label>
                <ul className="list-disc list-inside space-y-1 text-body text-text-medium">
                  {selectedTemplate.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    loadTemplate(selectedTemplate)
                    setSelectedTemplate(null)
                  }}
                  className="btn-primary"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateGallery