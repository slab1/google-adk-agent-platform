import React, { useState } from 'react'
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
  Terminal
} from 'lucide-react'
import { useStore } from '../store'

const toolOptions = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the internet for information',
    icon: Globe,
    category: 'search'
  },
  {
    id: 'code_execution',
    name: 'Code Execution',
    description: 'Run code snippets in a sandbox',
    icon: Code,
    category: 'development'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Execute shell commands',
    icon: Terminal,
    category: 'development'
  },
  {
    id: 'file_operations',
    name: 'File Operations',
    description: 'Read and write files',
    icon: Settings,
    category: 'utility'
  },
  {
    id: 'api_calls',
    name: 'API Calls',
    description: 'Make HTTP requests to external APIs',
    icon: Zap,
    category: 'utility'
  }
]

export default function AgentBuilder() {
  const { models, addAgent } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: '',
    systemPrompt: '',
    tools: [] as string[],
    temperature: 1.0,
    maxIterations: 5
  })
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'tools'>('basic')
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleToolToggle = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(id => id !== toolId)
        : [...prev.tools, toolId]
    }))
  }
  
  const handleSave = () => {
    if (!formData.name || !formData.model) {
      alert('Please fill in required fields')
      return
    }
    
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      model: formData.model,
      status: 'inactive' as const,
      created_at: new Date().toISOString(),
      conversations: 0,
      system_prompt: formData.systemPrompt,
      tools: formData.tools,
      temperature: formData.temperature,
      max_iterations: formData.maxIterations
    }
    
    addAgent(newAgent)
    alert('Agent created successfully!')
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      model: '',
      systemPrompt: '',
      tools: [],
      temperature: 1.0,
      maxIterations: 5
    })
  }
  
  const toolsByCategory = toolOptions.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = []
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof toolOptions>)
  
  return (
    <div className="flex h-full">
      {/* Agent Builder Panel */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-display text-text-high mb-2">Agent Builder</h1>
            <p className="text-body text-text-medium">
              Create and configure your ADK agents with MiniMax-M2 and custom models
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Template
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Agent
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-surface-1 p-1 rounded-sharp">
          {[
            { id: 'basic', label: 'Basic Configuration', icon: Bot },
            { id: 'advanced', label: 'Advanced Settings', icon: Settings },
            { id: 'tools', label: 'Tools & Capabilities', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-sharp transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-text-medium hover:text-text-high hover:bg-surface-2'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-body font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* Tab Content */}
        <div className="bg-surface-1 border border-border rounded-mild p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter agent name"
                    className="form-input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                    Model *
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="">Select a model</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this agent does"
                  rows={3}
                  className="form-textarea w-full"
                />
              </div>
              
              <div>
                <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                  System Prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  placeholder="Define the agent's behavior and personality..."
                  rows={6}
                  className="form-textarea w-full font-mono text-small"
                />
                <p className="text-small text-text-medium mt-2">
                  This prompt defines how the agent should behave and respond to users.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                    Temperature: {formData.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-small text-text-medium mt-1">
                    <span>Focused (0.0)</span>
                    <span>Creative (2.0)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxIterations}
                    onChange={(e) => handleInputChange('maxIterations', parseInt(e.target.value))}
                    className="form-input w-full"
                  />
                </div>
              </div>
              
              <div className="bg-surface-card border border-border rounded-sharp p-4">
                <h3 className="text-subheading text-text-high mb-3">Performance Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-medium">Enable Streaming</span>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-medium">Enable Function Calling</span>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-medium">Enable Memory</span>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-subheading text-text-high mb-4">Available Tools</h3>
                <p className="text-body text-text-medium mb-6">
                  Select tools to give your agent additional capabilities
                </p>
              </div>
              
              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-body font-medium text-text-high capitalize">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map(tool => {
                      const Icon = tool.icon
                      const isSelected = formData.tools.includes(tool.id)
                      return (
                        <div
                          key={tool.id}
                          onClick={() => handleToolToggle(tool.id)}
                          className={`p-4 border rounded-sharp cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-border hover:border-border-hover'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-sharp flex items-center justify-center ${
                              isSelected ? 'bg-primary-500' : 'bg-surface-card'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isSelected ? 'text-white' : 'text-text-medium'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-body font-medium text-text-high">
                                {tool.name}
                              </h5>
                              <p className="text-small text-text-medium mt-1">
                                {tool.description}
                              </p>
                            </div>
                            <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${
                              isSelected
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-border'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-sm"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Panel */}
      <div className="w-80 bg-surface-1 border-l border-border p-6 overflow-auto">
        <h3 className="text-subheading text-text-high mb-4">Agent Preview</h3>
        
        <div className="space-y-4">
          <div className="bg-surface-card border border-border rounded-sharp p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-body font-medium text-text-high">
                  {formData.name || 'Untitled Agent'}
                </div>
                <div className="text-small text-text-medium">
                  {models.find(m => m.id === formData.model)?.name || 'No model selected'}
                </div>
              </div>
            </div>
            
            <p className="text-small text-text-medium">
              {formData.description || 'No description provided'}
            </p>
          </div>
          
          <div>
            <h4 className="text-small text-text-medium uppercase tracking-wide mb-2">
              Selected Tools ({formData.tools.length})
            </h4>
            <div className="space-y-2">
              {formData.tools.map(toolId => {
                const tool = toolOptions.find(t => t.id === toolId)
                if (!tool) return null
                
                const Icon = tool.icon
                return (
                  <div key={toolId} className="flex items-center space-x-2 text-small">
                    <Icon className="w-4 h-4 text-text-medium" />
                    <span className="text-text-high">{tool.name}</span>
                  </div>
                )
              })}
              {formData.tools.length === 0 && (
                <p className="text-small text-text-medium">No tools selected</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-small text-text-medium uppercase tracking-wide mb-2">
              Configuration
            </h4>
            <div className="space-y-2 text-small">
              <div className="flex justify-between">
                <span className="text-text-medium">Temperature:</span>
                <span className="text-text-high font-mono">{formData.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-medium">Max Iterations:</span>
                <span className="text-text-high font-mono">{formData.maxIterations}</span>
              </div>
            </div>
          </div>
          
          <button className="w-full btn-primary">
            <Play className="w-4 h-4 mr-2" />
            Test Agent
          </button>
        </div>
      </div>
    </div>
  )
}