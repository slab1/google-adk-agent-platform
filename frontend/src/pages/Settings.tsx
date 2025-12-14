import React, { useState } from 'react'
import { 
  Save, 
  RefreshCw, 
  Database, 
  Key, 
  Server, 
  Monitor,
  Shield,
  Bell,
  Download,
  Upload,
  Trash2
} from 'lucide-react'
import { useStore } from '../store'

export default function Settings() {
  const { theme, setTheme } = useStore()
  const [settings, setSettings] = useState({
    // General Settings
    defaultModel: 'minimax-m2-api',
    autoSave: true,
    showTooltips: true,
    compactMode: false,
    
    // API Settings
    openaiKey: '',
    anthropicKey: '',
    minimaxKey: '',
    customApiBase: '',
    
    // Performance Settings
    maxConcurrentRequests: 5,
    requestTimeout: 30000,
    enableCaching: true,
    cacheSize: '1GB',
    
    // Security Settings
    enableEncryption: true,
    logLevel: 'info',
    enableMetrics: true,
    
    // Notifications
    emailNotifications: false,
    desktopNotifications: true,
    soundEnabled: false
  })
  
  const [activeSection, setActiveSection] = useState('general')
  
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('adk-settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to defaults
      localStorage.removeItem('adk-settings')
      window.location.reload()
    }
  }
  
  const sections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'performance', label: 'Performance', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database }
  ]

  return (
    <div className="flex h-full">
      {/* Settings Navigation */}
      <div className="w-64 bg-surface-1 border-r border-border p-4">
        <h2 className="text-heading text-text-high mb-6">Settings</h2>
        
        <nav className="space-y-1">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-sharp transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-primary-500 text-white'
                    : 'text-text-medium hover:text-text-high hover:bg-surface-2'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-body font-medium">{section.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      
      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                      className="form-select w-full"
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Default Model
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="minimax-m2-api">MiniMax-M2 (API)</option>
                      <option value="minimax-m2-local">MiniMax-M2 (Local)</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-body text-text-high">Auto-save conversations</div>
                        <div className="text-small text-text-medium">Automatically save chat history</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                        className="toggle-switch"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-body text-text-high">Show tooltips</div>
                        <div className="text-small text-text-medium">Display helpful tooltips throughout the interface</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showTooltips}
                        onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                        className="toggle-switch"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-body text-text-high">Compact mode</div>
                        <div className="text-small text-text-medium">Use a more compact interface layout</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        className="toggle-switch"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* API Settings */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">API Configuration</h3>
                <p className="text-body text-text-medium mb-6">
                  Configure API keys and endpoints for external model services
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={settings.openaiKey}
                      onChange={(e) => handleSettingChange('openaiKey', e.target.value)}
                      placeholder="sk-..."
                      className="form-input w-full font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Anthropic API Key
                    </label>
                    <input
                      type="password"
                      value={settings.anthropicKey}
                      onChange={(e) => handleSettingChange('anthropicKey', e.target.value)}
                      placeholder="sk-ant-..."
                      className="form-input w-full font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      MiniMax API Key
                    </label>
                    <input
                      type="password"
                      value={settings.minimaxKey}
                      onChange={(e) => handleSettingChange('minimaxKey', e.target.value)}
                      placeholder="Enter MiniMax API key"
                      className="form-input w-full font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Custom API Base URL
                    </label>
                    <input
                      type="url"
                      value={settings.customApiBase}
                      onChange={(e) => handleSettingChange('customApiBase', e.target.value)}
                      placeholder="https://api.example.com/v1"
                      className="form-input w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Performance Settings */}
          {activeSection === 'performance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">Performance Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Max Concurrent Requests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.maxConcurrentRequests}
                      onChange={(e) => handleSettingChange('maxConcurrentRequests', parseInt(e.target.value))}
                      className="form-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Request Timeout (ms)
                    </label>
                    <input
                      type="number"
                      min="5000"
                      max="120000"
                      step="5000"
                      value={settings.requestTimeout}
                      onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value))}
                      className="form-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Cache Size
                    </label>
                    <select
                      value={settings.cacheSize}
                      onChange={(e) => handleSettingChange('cacheSize', e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="256MB">256 MB</option>
                      <option value="512MB">512 MB</option>
                      <option value="1GB">1 GB</option>
                      <option value="2GB">2 GB</option>
                      <option value="4GB">4 GB</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body text-text-high">Enable Response Caching</div>
                      <div className="text-small text-text-medium">Cache model responses to improve performance</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableCaching}
                      onChange={(e) => handleSettingChange('enableCaching', e.target.checked)}
                      className="toggle-switch"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">Security Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-small text-text-medium uppercase tracking-wide mb-2">
                      Log Level
                    </label>
                    <select
                      value={settings.logLevel}
                      onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="error">Error Only</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-body text-text-high">Enable Encryption</div>
                        <div className="text-small text-text-medium">Encrypt sensitive data at rest</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableEncryption}
                        onChange={(e) => handleSettingChange('enableEncryption', e.target.checked)}
                        className="toggle-switch"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-body text-text-high">Enable Metrics Collection</div>
                        <div className="text-small text-text-medium">Collect performance and usage metrics</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableMetrics}
                        onChange={(e) => handleSettingChange('enableMetrics', e.target.checked)}
                        className="toggle-switch"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">Notification Preferences</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body text-text-high">Email Notifications</div>
                      <div className="text-small text-text-medium">Receive email alerts for important events</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="toggle-switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body text-text-high">Desktop Notifications</div>
                      <div className="text-small text-text-medium">Show desktop notifications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.desktopNotifications}
                      onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
                      className="toggle-switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-body text-text-high">Sound Alerts</div>
                      <div className="text-small text-text-medium">Play sounds for notifications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      className="toggle-switch"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Data Management */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-heading text-text-high mb-4">Data Management</h3>
                
                <div className="space-y-4">
                  <div className="bg-surface-card border border-border rounded-sharp p-4">
                    <h4 className="text-body font-medium text-text-high mb-2">Export Data</h4>
                    <p className="text-small text-text-medium mb-3">
                      Export your agents, conversations, and settings
                    </p>
                    <button className="btn-secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </button>
                  </div>
                  
                  <div className="bg-surface-card border border-border rounded-sharp p-4">
                    <h4 className="text-body font-medium text-text-high mb-2">Import Data</h4>
                    <p className="text-small text-text-medium mb-3">
                      Import agents and conversations from a backup file
                    </p>
                    <button className="btn-secondary">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </button>
                  </div>
                  
                  <div className="bg-surface-card border border-error rounded-sharp p-4">
                    <h4 className="text-body font-medium text-error mb-2">Danger Zone</h4>
                    <p className="text-small text-text-medium mb-3">
                      Permanently delete all data and reset to defaults
                    </p>
                    <button 
                      onClick={handleReset}
                      className="bg-error hover:bg-error/90 text-white px-4 py-2 rounded-sharp transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset All Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-3">
        <button 
          onClick={handleReset}
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </button>
        <button 
          onClick={handleSave}
          className="btn-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  )
}