import React from 'react'
import { 
  Bot, 
  Cpu, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Server
} from 'lucide-react'
import { useStore } from '../store'

export default function Dashboard() {
  const { models, agents } = useStore()
  
  const stats = [
    {
      name: 'Total Models',
      value: models.length,
      change: '+2 this week',
      icon: Cpu,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10'
    },
    {
      name: 'Active Agents',
      value: agents.filter(a => a.status === 'active').length,
      change: `${agents.length} total`,
      icon: Bot,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      name: 'Conversations',
      value: agents.reduce((acc, agent) => acc + agent.conversations, 0),
      change: '+12 today',
      icon: MessageSquare,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/10'
    },
    {
      name: 'System Health',
      value: '99.9%',
      change: 'All systems operational',
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ]
  
  const recentActivity = [
    {
      id: '1',
      type: 'agent_created',
      message: 'New agent "Code Assistant" created',
      timestamp: '2 minutes ago',
      icon: Bot
    },
    {
      id: '2',
      type: 'model_tested',
      message: 'MiniMax-M2 model test completed',
      timestamp: '5 minutes ago',
      icon: Cpu
    },
    {
      id: '3',
      type: 'conversation',
      message: '15 new messages in "Chat Agent"',
      timestamp: '12 minutes ago',
      icon: MessageSquare
    },
    {
      id: '4',
      type: 'system',
      message: 'System performance optimized',
      timestamp: '1 hour ago',
      icon: Server
    }
  ]
  
  const modelStatus = models.map(model => ({
    name: model.name,
    type: model.type,
    status: model.status,
    provider: model.provider,
    performance: model.performance || {
      latency: Math.floor(Math.random() * 200) + 50,
      throughput: Math.floor(Math.random() * 1000) + 500,
      uptime: Math.floor(Math.random() * 5) + 95
    }
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-display text-text-high mb-2">Dashboard</h1>
        <p className="text-body text-text-medium">
          Monitor your AI agent development platform
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-surface-1 border border-border rounded-mild p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-medium uppercase tracking-wide">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-text-high mt-1">
                    {stat.value}
                  </p>
                  <p className="text-small text-text-medium mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-sharp flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Status */}
        <div className="bg-surface-1 border border-border rounded-mild p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading text-text-high">Model Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-small text-text-medium">All Online</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {modelStatus.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface-card rounded-sharp border border-border">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    model.status === 'active' ? 'bg-success' : 
                    model.status === 'error' ? 'bg-error' : 'bg-warning'
                  }`}></div>
                  <div>
                    <p className="text-body font-medium text-text-high">{model.name}</p>
                    <p className="text-small text-text-medium">
                      {model.type} • {model.provider}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-small font-mono text-text-high">
                    {model.performance.latency}ms
                  </p>
                  <p className="text-small text-text-medium">
                    {model.performance.throughput} tok/s
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-surface-1 border border-border rounded-mild p-6">
          <h2 className="text-heading text-text-high mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-surface-card rounded-sharp flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-text-medium" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-high">{activity.message}</p>
                    <p className="text-small text-text-medium mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Performance Overview */}
      <div className="bg-surface-1 border border-border rounded-mild p-6">
        <h2 className="text-heading text-text-high mb-4">Performance Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-text-high mb-2">142ms</div>
            <div className="text-small text-text-medium uppercase tracking-wide">Avg Response Time</div>
            <div className="text-small text-success mt-1">↓ 12ms from last hour</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-text-high mb-2">847</div>
            <div className="text-small text-text-medium uppercase tracking-wide">Tokens/Second</div>
            <div className="text-small text-success mt-1">↑ 23 tok/s from last hour</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-text-high mb-2">99.9%</div>
            <div className="text-small text-text-medium uppercase tracking-wide">Uptime</div>
            <div className="text-small text-success mt-1">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  )
}