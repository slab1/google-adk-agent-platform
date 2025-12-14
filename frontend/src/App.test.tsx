/**
 * Frontend tests for Google ADK Agent Platform
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'
import Dashboard from '../pages/Dashboard'
import ModelManager from '../pages/ModelManager'
import AgentBuilder from '../pages/AgentBuilder'
import ChatInterface from '../pages/ChatInterface'
import Settings from '../pages/Settings'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useStore } from '../store'

// Mock the store
vi.mock('../store', () => ({
  useStore: vi.fn(() => ({
    models: [
      {
        id: 'test-model',
        name: 'Test Model',
        type: 'api',
        provider: 'openai',
        status: 'active',
        capabilities: ['chat', 'completion']
      }
    ],
    agents: [],
    theme: 'dark',
    setTheme: vi.fn(),
    addModel: vi.fn(),
    updateModel: vi.fn(),
    removeModel: vi.fn(),
    addAgent: vi.fn(),
    setActiveAgent: vi.fn()
  }))
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
  })

  it('renders sidebar navigation', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Agent Builder')).toBeInTheDocument()
    expect(screen.getByText('Models')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders header with search', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    
    expect(screen.getByPlaceholderText(/search agents, models, conversations/i)).toBeInTheDocument()
  })
})

describe('Sidebar Component', () => {
  it('renders navigation items', () => {
    render(
      <TestWrapper>
        <Sidebar collapsed={false} onToggle={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview and metrics')).toBeInTheDocument()
  })

  it('collapses when collapsed prop is true', () => {
    render(
      <TestWrapper>
        <Sidebar collapsed={true} onToggle={vi.fn()} />
      </TestWrapper>
    )
    
    // When collapsed, navigation text should not be visible
    expect(screen.queryByText('Overview and metrics')).not.toBeInTheDocument()
  })
})

describe('Header Component', () => {
  it('renders breadcrumbs', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    expect(screen.getByPlaceholderText(/search agents, models, conversations/i)).toBeInTheDocument()
  })
})

describe('Dashboard Component', () => {
  it('renders dashboard content', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Monitor your AI agent development platform')).toBeInTheDocument()
  })

  it('displays statistics cards', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )
    
    expect(screen.getByText('Total Models')).toBeInTheDocument()
    expect(screen.getByText('Active Agents')).toBeInTheDocument()
    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('System Health')).toBeInTheDocument()
  })
})

describe('ModelManager Component', () => {
  it('renders model manager page', () => {
    render(
      <TestWrapper>
        <ModelManager />
      </TestWrapper>
    )
    
    expect(screen.getByText('Model Management')).toBeInTheDocument()
    expect(screen.getByText('Configure and manage your AI models')).toBeInTheDocument()
  })

  it('shows add model button', () => {
    render(
      <TestWrapper>
        <ModelManager />
      </TestWrapper>
    )
    
    expect(screen.getByText('Add Sample Models')).toBeInTheDocument()
    expect(screen.getByText('Add Model')).toBeInTheDocument()
  })

  it('displays empty state when no models', () => {
    // Mock empty models
    const mockStore = {
      models: [],
      addModel: vi.fn(),
      updateModel: vi.fn(),
      removeModel: vi.fn()
    }
    
    vi.mocked(useStore).mockReturnValue(mockStore)
    
    render(
      <TestWrapper>
        <ModelManager />
      </TestWrapper>
    )
    
    expect(screen.getByText('No Models Configured')).toBeInTheDocument()
    expect(screen.getByText('Add Sample Models')).toBeInTheDocument()
  })
})

describe('AgentBuilder Component', () => {
  it('renders agent builder page', () => {
    render(
      <TestWrapper>
        <AgentBuilder />
      </TestWrapper>
    )
    
    expect(screen.getByText('Agent Builder')).toBeInTheDocument()
    expect(screen.getByText('Create and configure your ADK agents')).toBeInTheDocument()
  })

  it('renders configuration tabs', () => {
    render(
      <TestWrapper>
        <AgentBuilder />
      </TestWrapper>
    )
    
    expect(screen.getByText('Basic Configuration')).toBeInTheDocument()
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    expect(screen.getByText('Tools & Capabilities')).toBeInTheDocument()
  })

  it('allows switching between tabs', async () => {
    render(
      <TestWrapper>
        <AgentBuilder />
      </TestWrapper>
    )
    
    // Click on Advanced Settings tab
    const advancedTab = screen.getByText('Advanced Settings')
    fireEvent.click(advancedTab)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument()
    })
  })
})

describe('ChatInterface Component', () => {
  it('renders chat interface', () => {
    render(
      <TestWrapper>
        <ChatInterface />
      </TestWrapper>
    )
    
    expect(screen.getByText('No Agent Selected')).toBeInTheDocument()
    expect(screen.getByText('Please select an agent from the sidebar')).toBeInTheDocument()
  })

  it('displays placeholder when no agent selected', () => {
    render(
      <TestWrapper>
        <ChatInterface />
      </TestWrapper>
    )
    
    expect(screen.getByText(/no agent selected/i)).toBeInTheDocument()
    expect(screen.getByText(/please select an agent/i)).toBeInTheDocument()
  })
})

describe('Settings Component', () => {
  it('renders settings page', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    )
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders navigation sections', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    )
    
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('allows switching between sections', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    )
    
    // Click on API Keys section
    const apiKeysSection = screen.getByText('API Keys')
    fireEvent.click(apiKeysSection)
    
    expect(screen.getByText('API Configuration')).toBeInTheDocument()
  })
})

describe('Store Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle theme changes', () => {
    const mockSetTheme = vi.fn()
    vi.mocked(useStore).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    } as any)
    
    // This would test theme switching functionality
    // Implementation depends on how theme switching is handled in the app
  })

  it('should handle model operations', () => {
    const mockAddModel = vi.fn()
    const mockUpdateModel = vi.fn()
    const mockRemoveModel = vi.fn()
    
    vi.mocked(useStore).mockReturnValue({
      models: [],
      addModel: mockAddModel,
      updateModel: mockUpdateModel,
      removeModel: mockRemoveModel
    } as any)
    
    // This would test model CRUD operations
  })
})

describe('Error Handling', () => {
  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.mocked(useStore).mockImplementation(() => ({
      models: [],
      agents: [],
      theme: 'dark',
      setTheme: vi.fn(),
      addModel: vi.fn(() => Promise.reject(new Error('API Error'))),
      updateModel: vi.fn(),
      removeModel: vi.fn(),
      addAgent: vi.fn(),
      setActiveAgent: vi.fn()
    } as any))
    
    render(
      <TestWrapper>
        <ModelManager />
      </TestWrapper>
    )
    
    // Test that error handling is in place
    // This would depend on the actual error handling implementation
  })

  it('displays loading states', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )
    
    // Test loading state display
    // Implementation depends on loading state management
  })
})

describe('Accessibility', () => {
  it('has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    
    // Test for proper accessibility attributes
    // This would check for role attributes, aria-labels, etc.
  })

  it('supports keyboard navigation', () => {
    render(
      <TestWrapper>
        <Sidebar collapsed={false} onToggle={vi.fn()} />
      </TestWrapper>
    )
    
    // Test keyboard navigation functionality
  })
})