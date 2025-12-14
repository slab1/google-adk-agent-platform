import React, { useState } from 'react'
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Cpu,
  Cloud,
  Server,
  Zap,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { useStore } from '../store'

interface ModelCardProps {
  model: any
  onTest: (model: any) => void
  onToggle: (model: any) => void
  onDelete: (model: any) => void
}

function ModelCard({ model, onTest, onToggle, onDelete }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getStatusIcon = () => {
    switch (model.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'error':
        return <XCircle className="w-4 h-4 text-error" />
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />
    }
  }
  
  const getTypeIcon = () => {
    switch (model.type) {
      case 'local':
        return <Server className="w-5 h-5 text-accent-500" />
      case 'api':
        return <Cloud className="w-5 h-5 text-primary-500" />
      default:
        return <Cpu className="w-5 h-5 text-text-medium" />
    }
  }
  
  return (
    <div className="bg-surface-1 border border-border rounded-mild p-6 hover:border-border-hover transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-subheading text-text-high">{model.name}</h3>
            <p className="text-body text-text-medium">
              {model.provider} • {model.model_id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <button
            onClick={() => onToggle(model)}
            className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
          >
            {model.status === 'active' ? (
              <Pause className="w-4 h-4 text-text-medium" />
            ) : (
              <Play className="w-4 h-4 text-text-medium" />
            )}
          </button>
          <button
            onClick={() => onTest(model)}
            className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
          >
            <Zap className="w-4 h-4 text-text-medium" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
          >
            <Settings className="w-4 h-4 text-text-medium" />
          </button>
          <button
            onClick={() => onDelete(model)}
            className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </button>
        </div>
      </div>
      
      {/* Capabilities */}
      <div className="flex flex-wrap gap-2 mb-4">
        {model.capabilities.map((capability: string) => (
          <span
            key={capability}
            className="px-2 py-1 bg-surface-card border border-border rounded-sharp text-small text-text-medium"
          >
            {capability}
          </span>
        ))}
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-body font-mono text-text-high">
            {model.performance?.latency || '--'}ms
          </div>
          <div className="text-small text-text-medium">Latency</div>
        </div>
        <div className="text-center">
          <div className="text-body font-mono text-text-high">
            {model.performance?.throughput || '--'}
          </div>
          <div className="text-small text-text-medium">Tokens/sec</div>
        </div>
        <div className="text-center">
          <div className="text-body font-mono text-text-high">
            {model.performance?.uptime || '--'}%
          </div>
          <div className="text-small text-text-medium">Uptime</div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <h4 className="text-small text-text-medium uppercase tracking-wide mb-2">
              Configuration
            </h4>
            <div className="bg-surface-card border border-border rounded-sharp p-3">
              <pre className="text-small text-text-high font-mono overflow-x-auto">
                {JSON.stringify(model.parameters, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-small text-text-medium uppercase tracking-wide mb-2">
              API Endpoint
            </h4>
            <div className="bg-surface-card border border-border rounded-sharp p-3">
              <code className="text-small text-text-high font-mono">
                {model.api_base || 'Not configured'}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ModelManager() {
  const { models, addModel, updateModel, removeModel } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [testModel, setTestModel] = useState<any>(null)
  
  const handleTestModel = async (model: any) => {
    setTestModel(model)
    // Simulate testing
    setTimeout(() => {
      setTestModel(null)
      // Update model performance
      updateModel(model.id, {
        performance: {
          latency: Math.floor(Math.random() * 200) + 50,
          throughput: Math.floor(Math.random() * 1000) + 500,
          uptime: Math.floor(Math.random() * 5) + 95
        },
        status: 'active'
      })
    }, 2000)
  }
  
  const handleToggleModel = (model: any) => {
    const newStatus = model.status === 'active' ? 'inactive' : 'active'
    updateModel(model.id, { status: newStatus })
  }
  
  const handleDeleteModel = (model: any) => {
    if (confirm(`Are you sure you want to delete ${model.name}?`)) {
      removeModel(model.id)
    }
  }
  
  const addSampleModels = () => {
    const sampleModels = [
      {
        id: 'minimax-m2-local',
        name: 'MiniMax-M2 (Local)',
        type: 'local',
        provider: 'vllm',
        model_id: 'minimax-m2',
        status: 'active' as const,
        capabilities: ['chat', 'completion', 'coding', 'agentic'],
        performance: {
          latency: 142,
          throughput: 847,
          uptime: 99.9
        },
        api_base: 'http://localhost:8000/v1',
        parameters: {
          temperature: 1.0,
          top_p: 0.95,
          max_tokens: 2048
        }
      },
      {
        id: 'minimax-m2-api',
        name: 'MiniMax-M2 (API)',
        type: 'api' as const,
        provider: 'minimax',
        model_id: 'minimax-m2',
        status: 'active' as const,
        capabilities: ['chat', 'completion', 'coding', 'agentic'],
        performance: {
          latency: 89,
          throughput: 1200,
          uptime: 99.8
        },
        api_key: '***hidden***',
        parameters: {
          temperature: 1.0,
          top_p: 0.95,
          max_tokens: 2048
        }
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        type: 'api' as const,
        provider: 'openai',
        model_id: 'gpt-4o',
        status: 'active' as const,
        capabilities: ['chat', 'completion', 'vision'],
        performance: {
          latency: 234,
          throughput: 456,
          uptime: 99.5
        },
        api_key: '***hidden***',
        parameters: {
          temperature: 1.0,
          top_p: 0.95,
          max_tokens: 2048
        }
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        type: 'api' as const,
        provider: 'anthropic',
        model_id: 'claude-3-sonnet-20240229',
        status: 'inactive' as const,
        capabilities: ['chat', 'completion', 'analysis'],
        performance: {
          latency: 312,
          throughput: 378,
          uptime: 99.2
        },
        api_key: '***hidden***',
        parameters: {
          temperature: 1.0,
          top_p: 0.95,
          max_tokens: 2048
        }
      }
    ]
    
    sampleModels.forEach(model => addModel(model))
    setShowAddModal(false)
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-text-high mb-2">Model Management</h1>
          <p className="text-body text-text-medium">
            Configure and manage your AI models including MiniMax-M2 local and API versions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={addSampleModels}
            className="btn-secondary"
          >
            Add Sample Models
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </button>
        </div>
      </div>
      
      {/* Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onTest={handleTestModel}
            onToggle={handleToggleModel}
            onDelete={handleDeleteModel}
          />
        ))}
      </div>
      
      {/* Empty State */}
      {models.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="w-16 h-16 text-text-disabled mx-auto mb-4" />
          <h3 className="text-heading text-text-high mb-2">No Models Configured</h3>
          <p className="text-body text-text-medium mb-6">
            Add your first model to get started with AI agent development
          </p>
          <button
            onClick={addSampleModels}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Models
          </button>
        </div>
      )}
      
      {/* Test Modal */}
      {testModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-1 border border-border rounded-mild p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-primary-500 animate-pulse" />
              <h3 className="text-heading text-text-high">Testing Model</h3>
            </div>
            <p className="text-body text-text-medium mb-4">
              Testing {testModel.name} with a sample prompt...
            </p>
            <div className="bg-surface-card border border-border rounded-sharp p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}