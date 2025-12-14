import React, { useState, useEffect } from 'react'
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
  Users,
  TrendingUp,
  Filter as FilterIcon
} from 'lucide-react'

// Plugin interface
interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: string
  tags: string[]
  icon: string
  screenshots: string[]
  rating: number
  downloads: number
  price: number
  isInstalled: boolean
  isActive: boolean
  dependencies: string[]
  status: 'available' | 'installed' | 'development'
  verified: boolean
  featured: boolean
  trending: boolean
  new: boolean
}

const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showInstalled, setShowInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [installationProgress, setInstallationProgress] = useState<Record<string, number>>({})

  const categories = [
    { value: 'all', label: 'All Categories', icon: Package },
    { value: 'communication', label: 'Communication', icon: Users },
    { value: 'automation', label: 'Automation', icon: Zap },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'integration', label: 'Integration', icon: GitBranch },
    { value: 'utility', label: 'Utility', icon: Settings }
  ]

  // Sample plugin data
  const samplePlugins: Plugin[] = [
    {
      id: 'webhook-handler',
      name: 'Webhook Handler',
      description: 'Advanced webhook processing with retry logic and error handling',
      version: '2.1.0',
      author: 'ADK Team',
      category: 'integration',
      tags: ['webhook', 'api', 'retry', 'error-handling'],
      icon: '🔗',
      screenshots: [],
      rating: 4.8,
      downloads: 1250,
      price: 0,
      isInstalled: true,
      isActive: true,
      dependencies: ['json-webtoken', 'axios'],
      status: 'installed',
      verified: true,
      featured: true,
      trending: false,
      new: false
    },
    {
      id: 'slack-integration',
      name: 'Slack Integration',
      description: 'Seamless integration with Slack for notifications and commands',
      version: '1.5.2',
      author: 'Community',
      category: 'communication',
      tags: ['slack', 'notifications', 'chat', 'commands'],
      icon: '💬',
      screenshots: [],
      rating: 4.6,
      downloads: 890,
      price: 0,
      isInstalled: false,
      isActive: false,
      dependencies: ['@slack/web-api'],
      status: 'available',
      verified: true,
      featured: false,
      trending: true,
      new: false
    },
    {
      id: 'analytics-tracker',
      name: 'Analytics Tracker',
      description: 'Real-time analytics and performance monitoring for agents',
      version: '3.0.1',
      author: 'ADK Team',
      category: 'analytics',
      tags: ['analytics', 'monitoring', 'performance', 'metrics'],
      icon: '📊',
      screenshots: [],
      rating: 4.9,
      downloads: 2100,
      price: 0,
      isInstalled: true,
      isActive: false,
      dependencies: ['chart.js', 'moment'],
      status: 'installed',
      verified: true,
      featured: true,
      trending: true,
      new: false
    },
    {
      id: 'security-scanner',
      name: 'Security Scanner',
      description: 'Automated security vulnerability scanning and compliance checking',
      version: '1.2.0',
      author: 'Security Team',
      category: 'security',
      tags: ['security', 'scanning', 'compliance', 'vulnerability'],
      icon: '🛡️',
      screenshots: [],
      rating: 4.7,
      downloads: 450,
      price: 29.99,
      isInstalled: false,
      isActive: false,
      dependencies: ['lodash', 'crypto-js'],
      status: 'available',
      verified: true,
      featured: false,
      trending: false,
      new: true
    },
    {
      id: 'auto-scheduler',
      name: 'Auto Scheduler',
      description: 'Intelligent task scheduling with priority management',
      version: '2.3.1',
      author: 'ADK Team',
      category: 'automation',
      tags: ['scheduling', 'tasks', 'priority', 'automation'],
      icon: '⏰',
      screenshots: [],
      rating: 4.5,
      downloads: 1200,
      price: 0,
      isInstalled: false,
      isActive: false,
      dependencies: ['node-cron', 'p-limit'],
      status: 'available',
      verified: true,
      featured: false,
      trending: false,
      new: false
    }
  ]

  useEffect(() => {
    setPlugins(samplePlugins)
  }, [])

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    
    const matchesInstalled = !showInstalled || plugin.isInstalled
    
    return matchesSearch && matchesCategory && matchesInstalled
  })

  const installPlugin = async (pluginId: string) => {
    setIsLoading(true)
    setInstallationProgress(prev => ({ ...prev, [pluginId]: 0 }))

    try {
      // Simulate installation progress
      const interval = setInterval(() => {
        setInstallationProgress(prev => {
          const current = prev[pluginId] || 0
          if (current < 90) {
            return { ...prev, [pluginId]: current + 10 }
          }
          return prev
        })
      }, 200)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(interval)

      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, isInstalled: true, status: 'installed' as const }
          : plugin
      ))

      setInstallationProgress(prev => ({ ...prev, [pluginId]: 100 }))
      setError(null)

      // Clear progress after delay
      setTimeout(() => {
        setInstallationProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[pluginId]
          return newProgress
        })
      }, 1000)

    } catch (err) {
      setError(`Failed to install plugin: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const uninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return

    setIsLoading(true)
    try {
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, isInstalled: false, isActive: false, status: 'available' as const }
          : plugin
      ))
      setError(null)
    } catch (err) {
      setError(`Failed to uninstall plugin: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlugin = async (pluginId: string, newStatus: boolean) => {
    setIsLoading(true)
    try {
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, isActive: newStatus }
          : plugin
      ))
      setError(null)
    } catch (err) {
      setError(`Failed to ${newStatus ? 'enable' : 'disable'} plugin: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-success'
      case 'available': return 'text-text-medium'
      case 'development': return 'text-warning'
      default: return 'text-text-medium'
    }
  }

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue)
    return category ? category.icon : Package
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
        <div>
          <h1 className="text-heading text-text-high">Plugin Marketplace</h1>
          <p className="text-small text-text-medium">Discover and install plugins to extend functionality</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plugin
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface-1 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-medium" />
              <input
                type="text"
                placeholder="Search plugins..."
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
            
            <label className="flex items-center space-x-2 text-small">
              <input
                type="checkbox"
                checked={showInstalled}
                onChange={(e) => setShowInstalled(e.target.checked)}
                className="form-checkbox"
              />
              <span>Show installed only</span>
            </label>
          </div>

          <div className="flex items-center space-x-6 text-small text-text-medium">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary-500" />
              <span>{filteredPlugins.length} Plugins</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-warning" />
              <span>Average 4.6★ rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 mx-6 mt-4 rounded-sharp">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-error hover:text-error/80"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Plugins Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredPlugins.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Package className="w-12 h-12 text-text-medium mx-auto mb-4" />
              <h3 className="text-heading text-text-high mb-2">No plugins found</h3>
              <p className="text-body text-text-medium mb-4">
                Try adjusting your search criteria or browse all plugins
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => {
              const CategoryIcon = getCategoryIcon(plugin.category)
              const isInstalling = installationProgress[plugin.id] !== undefined
              const installProgress = installationProgress[plugin.id] || 0

              return (
                <div key={plugin.id} className="bg-surface-card border border-border rounded-sharp overflow-hidden hover:border-primary-500 transition-colors">
                  {/* Plugin Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-sharp flex items-center justify-center text-xl">
                          {plugin.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-body font-medium text-text-high truncate">
                              {plugin.name}
                            </h3>
                            {plugin.verified && (
                              <Shield className="w-4 h-4 text-success" title="Verified" />
                            )}
                            {plugin.featured && (
                              <Star className="w-4 h-4 text-warning" title="Featured" />
                            )}
                            {plugin.new && (
                              <div className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                                NEW
                              </div>
                            )}
                            {plugin.trending && (
                              <TrendingUp className="w-4 h-4 text-warning" title="Trending" />
                            )}
                          </div>
                          <p className="text-small text-text-medium capitalize">{plugin.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-small text-text-high font-medium">{plugin.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-small text-text-medium mb-3 line-clamp-2">
                      {plugin.description}
                    </p>
                    
                    {/* Plugin Stats */}
                    <div className="flex items-center justify-between text-small text-text-medium">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{plugin.downloads}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={getStatusColor(plugin.status)}>
                            {plugin.status}
                          </span>
                        </div>
                        {plugin.price > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-success font-medium">${plugin.price}</span>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-small text-text-medium">v{plugin.version}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="px-6 py-3 border-b border-border">
                    <div className="flex flex-wrap gap-1">
                      {plugin.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                          {tag}
                        </span>
                      ))}
                      {plugin.tags.length > 3 && (
                        <span className="px-2 py-1 bg-surface-2 rounded text-small text-text-medium">
                          +{plugin.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4">
                    <div className="flex space-x-2">
                      {plugin.isInstalled ? (
                        <>
                          <button
                            onClick={() => togglePlugin(plugin.id, !plugin.isActive)}
                            disabled={isLoading}
                            className={`flex-1 text-sm px-3 py-2 rounded-sharp transition-colors ${
                              plugin.isActive 
                                ? 'bg-warning text-white hover:bg-warning/80' 
                                : 'bg-success text-white hover:bg-success/80'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {plugin.isActive ? (
                              <>
                                <Pause className="w-3 h-3 mr-1 inline" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1 inline" />
                                Enable
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setSelectedPlugin(plugin)}
                            className="btn-secondary text-sm"
                            title="Configure plugin"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => uninstallPlugin(plugin.id)}
                            disabled={isLoading}
                            className="btn-secondary text-sm text-error"
                            title="Uninstall plugin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => installPlugin(plugin.id)}
                            disabled={isLoading || isInstalling}
                            className={`btn-primary flex-1 text-sm ${
                              isInstalling ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isInstalling ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Installing... {installProgress}%
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Install
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setSelectedPlugin(plugin)}
                            className="btn-secondary text-sm"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Plugin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-1 rounded-sharp p-6 w-full max-w-md mx-4">
            <h3 className="text-subheading text-text-high mb-4">Create New Plugin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Plugin Name</label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Enter plugin name"
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea w-full"
                  rows="3"
                  placeholder="Describe what this plugin does"
                ></textarea>
              </div>
              
              <div>
                <label className="form-label">Category</label>
                <select className="form-select w-full">
                  {categories.slice(1).map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Plugin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-1 rounded-sharp p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subheading text-text-high">{selectedPlugin.name}</h3>
              <button
                onClick={() => setSelectedPlugin(null)}
                className="p-2 hover:bg-surface-2 rounded-sharp transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Description</label>
                <p className="text-body text-text-medium">{selectedPlugin.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Version</label>
                  <p className="text-body text-text-medium">{selectedPlugin.version}</p>
                </div>
                
                <div>
                  <label className="form-label">Author</label>
                  <p className="text-body text-text-medium">{selectedPlugin.author}</p>
                </div>
                
                <div>
                  <label className="form-label">Category</label>
                  <p className="text-body text-text-medium capitalize">{selectedPlugin.category}</p>
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <p className={`text-body ${getStatusColor(selectedPlugin.status)}`}>
                    {selectedPlugin.status}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="form-label">Dependencies</label>
                <div className="flex flex-wrap gap-1">
                  {selectedPlugin.dependencies.map(dep => (
                    <span key={dep} className="px-2 py-1 bg-surface-2 rounded text-small text-text-high">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PluginMarketplace