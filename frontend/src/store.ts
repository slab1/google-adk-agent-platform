import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Model {
  id: string
  name: string
  type: 'local' | 'api'
  provider: string
  model_id: string
  status: 'active' | 'inactive' | 'error'
  capabilities: string[]
  performance?: {
    latency: number
    throughput: number
    uptime: number
  }
}

interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'active' | 'inactive' | 'error'
  created_at: string
  last_used?: string
  conversations: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
}

interface AppStore {
  // UI State
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  rightPanelCollapsed: boolean
  
  // Data State
  models: Model[]
  agents: Agent[]
  activeAgent: Agent | null
  chatHistory: Record<string, ChatMessage[]>
  
  // Loading States
  isLoadingModels: boolean
  isLoadingAgents: boolean
  isConnecting: boolean
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setRightPanelCollapsed: (collapsed: boolean) => void
  
  // Models
  setModels: (models: Model[]) => void
  addModel: (model: Model) => void
  updateModel: (id: string, updates: Partial<Model>) => void
  removeModel: (id: string) => void
  
  // Agents
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
  setActiveAgent: (agent: Agent | null) => void
  
  // Chat
  addChatMessage: (agentId: string, message: ChatMessage) => void
  clearChatHistory: (agentId: string) => void
  setChatHistory: (agentId: string, messages: ChatMessage[]) => void
  
  // Loading
  setLoadingModels: (loading: boolean) => void
  setLoadingAgents: (loading: boolean) => void
  setConnecting: (connecting: boolean) => void
}

export const useStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      theme: 'dark',
      sidebarCollapsed: false,
      rightPanelCollapsed: false,
      models: [],
      agents: [],
      activeAgent: null,
      chatHistory: {},
      isLoadingModels: false,
      isLoadingAgents: false,
      isConnecting: false,
      
      // UI Actions
      setTheme: (theme) => set({ theme }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setRightPanelCollapsed: (rightPanelCollapsed) => set({ rightPanelCollapsed }),
      
      // Model Actions
      setModels: (models) => set({ models }),
      addModel: (model) => set((state) => ({ 
        models: [...state.models, model] 
      })),
      updateModel: (id, updates) => set((state) => ({
        models: state.models.map(model => 
          model.id === id ? { ...model, ...updates } : model
        )
      })),
      removeModel: (id) => set((state) => ({
        models: state.models.filter(model => model.id !== id)
      })),
      
      // Agent Actions
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) => set((state) => ({ 
        agents: [...state.agents, agent] 
      })),
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map(agent => 
          agent.id === id ? { ...agent, ...updates } : agent
        )
      })),
      removeAgent: (id) => set((state) => ({
        agents: state.agents.filter(agent => agent.id !== id),
        activeAgent: state.activeAgent?.id === id ? null : state.activeAgent
      })),
      setActiveAgent: (agent) => set({ activeAgent: agent }),
      
      // Chat Actions
      addChatMessage: (agentId, message) => set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [agentId]: [...(state.chatHistory[agentId] || []), message]
        }
      })),
      clearChatHistory: (agentId) => set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [agentId]: []
        }
      })),
      setChatHistory: (agentId, messages) => set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [agentId]: messages
        }
      })),
      
      // Loading Actions
      setLoadingModels: (isLoadingModels) => set({ isLoadingModels }),
      setLoadingAgents: (isLoadingAgents) => set({ isLoadingAgents }),
      setConnecting: (isConnecting) => set({ isConnecting }),
    }),
    {
      name: 'adk-agent-store',
    }
  )
)