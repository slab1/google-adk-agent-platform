import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  User, 
  MoreVertical,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useStore } from '../store'

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/builder': 'Agent Builder',
  '/models': 'Model Management',
  '/chat': 'Chat Interface',
  '/settings': 'Settings'
}

export default function Header() {
  const location = useLocation()
  const { isConnecting } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  
  const getBreadcrumbs = () => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    
    if (path === '/' || path === '/dashboard') {
      return ['Dashboard']
    }
    
    const breadcrumbs = segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/')
      const name = breadcrumbMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
      return name
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  return (
    <header className="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
      {/* Left Side - Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <nav className="flex items-center space-x-2 text-small">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-text-disabled">/</span>
              )}
              <span className={`${
                index === breadcrumbs.length - 1 
                  ? 'text-text-high font-medium' 
                  : 'text-text-medium hover:text-text-high cursor-pointer'
              }`}>
                {breadcrumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>
      
      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-medium" />
          <input
            type="text"
            placeholder="Search agents, models, conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border rounded-sharp text-body text-text-high placeholder-text-disabled focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors"
          />
        </div>
      </div>
      
      {/* Right Side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnecting ? (
            <WifiOff className="w-4 h-4 text-warning" />
          ) : (
            <Wifi className="w-4 h-4 text-success" />
          )}
          <span className="text-small text-text-medium">
            {isConnecting ? 'Connecting...' : 'Connected'}
          </span>
        </div>
        
        {/* Refresh Button */}
        <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors">
          <RefreshCw className="w-4 h-4 text-text-medium" />
        </button>
        
        {/* Notifications */}
        <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors relative">
          <Bell className="w-4 h-4 text-text-medium" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></div>
        </button>
        
        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center space-x-2 p-2 hover:bg-surface-2 rounded-sharp transition-colors">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-small text-text-high">Developer</div>
              <div className="text-small text-text-medium">Admin</div>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-1 border border-border rounded-sharp shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-body text-text-high hover:bg-surface-2 transition-colors">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-body text-text-high hover:bg-surface-2 transition-colors">
                Preferences
              </a>
              <div className="border-t border-border my-1"></div>
              <a href="#" className="block px-4 py-2 text-body text-text-high hover:bg-surface-2 transition-colors">
                Sign Out
              </a>
            </div>
          </div>
        </div>
        
        {/* More Options */}
        <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors">
          <MoreVertical className="w-4 h-4 text-text-medium" />
        </button>
      </div>
    </header>
  )
}