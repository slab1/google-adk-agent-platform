import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import AgentBuilder from './pages/AgentBuilder'
import ModelManager from './pages/ModelManager'
import ChatInterface from './pages/ChatInterface'
import Settings from './pages/Settings'
import { useStore } from './store'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const { theme } = useStore()

  return (
    <div className="h-screen flex bg-background text-text-high font-sans">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />
        
        {/* Main Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Content */}
          <main className="flex-1 overflow-auto scrollbar-custom">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/builder" element={<AgentBuilder />} />
              <Route path="/models" element={<ModelManager />} />
              <Route path="/chat/:agentId?" element={<ChatInterface />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          
          {/* Right Panel - Collapsible */}
          {!rightPanelCollapsed && (
            <aside className="w-80 bg-surface-1 border-l border-border p-6 overflow-auto scrollbar-custom">
              <div className="space-y-6">
                <h3 className="text-subheading text-text-high">Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-small text-text-medium uppercase tracking-wide">
                      Selected Agent
                    </label>
                    <div className="mt-1 p-3 bg-surface-card rounded-sharp border border-border">
                      <div className="text-body text-text-high">No agent selected</div>
                      <div className="text-small text-text-medium mt-1">
                        Select an agent to view properties
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-small text-text-medium uppercase tracking-wide">
                      Performance
                    </label>
                    <div className="mt-1 space-y-2">
                      <div className="flex justify-between text-body">
                        <span className="text-text-medium">Response Time</span>
                        <span className="text-text-high font-mono">--</span>
                      </div>
                      <div className="flex justify-between text-body">
                        <span className="text-text-medium">Token Count</span>
                        <span className="text-text-high font-mono">--</span>
                      </div>
                      <div className="flex justify-between text-body">
                        <span className="text-text-medium">Model Load</span>
                        <span className="text-text-high font-mono">--</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
          
          {/* Right Panel Toggle */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="w-6 bg-surface-1 border-l border-border flex items-center justify-center hover:bg-surface-2 transition-colors"
          >
            <div className="w-1 h-8 bg-border rounded-full"></div>
          </button>
        </div>
        
        {/* Status Bar */}
        <footer className="h-8 bg-surface-1 border-t border-border flex items-center px-4 text-small text-text-medium">
          <div className="flex items-center space-x-4">
            <span>Google ADK Agent Platform v1.0.0</span>
            <span className="text-text-disabled">•</span>
            <span>Ready</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <span className="text-text-medium">Models: 4</span>
            <span className="text-text-disabled">•</span>
            <span className="text-text-medium">Agents: 0</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App