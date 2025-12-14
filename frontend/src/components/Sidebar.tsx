import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Bot, 
  Cpu, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    name: 'Agent Builder',
    path: '/builder',
    icon: Bot,
    description: 'Create and configure agents'
  },
  {
    name: 'Models',
    path: '/models',
    icon: Cpu,
    description: 'Manage AI models'
  },
  {
    name: 'Chat',
    path: '/chat',
    icon: MessageSquare,
    description: 'Interactive chat interface'
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Application settings'
  }
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`bg-surface-1 border-r border-border flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo and Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-sharp flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-subheading font-semibold text-text-high">ADK Platform</h1>
              <p className="text-small text-text-medium">Agent Development</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-surface-2 rounded-sharp transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-text-medium" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text-medium" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-sharp transition-colors group ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-text-medium hover:text-text-high hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-body font-medium truncate">
                    {item.name}
                  </div>
                  <div className="text-small text-text-medium/70 truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>
      
      {/* Status Indicator */}
      <div className="px-3 py-4 border-t border-border">
        {!collapsed ? (
          <div className="flex items-center space-x-2 text-small text-text-medium">
            <div className="status-online"></div>
            <span>All systems operational</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="status-online"></div>
          </div>
        )}
      </div>
    </aside>
  )
}