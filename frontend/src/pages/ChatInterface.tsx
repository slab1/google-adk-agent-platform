import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreVertical,
  Bot,
  User,
  Clock,
  Cpu,
  Zap
} from 'lucide-react'
import { useStore } from '../store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
  isTyping?: boolean
}

export default function ChatInterface() {
  const { agentId } = useParams()
  const { agents, addChatMessage, chatHistory } = useStore()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const activeAgent = agents.find(a => a.id === agentId)
  const messages = agentId ? chatHistory[agentId] || [] : []
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !agentId) return
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }
    
    // Add user message
    addChatMessage(agentId, userMessage)
    setInputMessage('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: generateAIResponse(inputMessage, activeAgent?.name || 'Agent'),
        timestamp: new Date().toISOString(),
        model: activeAgent?.model || 'MiniMax-M2'
      }
      
      addChatMessage(agentId, assistantMessage)
      setIsTyping(false)
    }, 1500 + Math.random() * 1000) // Random delay to simulate thinking
  }
  
  const generateAIResponse = (userInput: string, agentName: string): string => {
    const responses = [
      `I understand you're asking about "${userInput}". As ${agentName}, I can help you with that using my advanced capabilities.`,
      `That's an interesting question! Based on my training with MiniMax-M2, I can provide insights on "${userInput}". Let me think through this...`,
      `I'd be happy to help with "${userInput}". My agentic workflow capabilities allow me to break this down systematically.`,
      `Great question! I'm processing "${userInput}" using my multi-step reasoning capabilities. Here's my analysis...`,
      `I'm analyzing "${userInput}" using my advanced AI capabilities. This is exactly the type of complex reasoning task I'm optimized for.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-surface-1 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-subheading text-text-high">
                {activeAgent?.name || 'Select an Agent'}
              </h1>
              <div className="flex items-center space-x-4 text-small text-text-medium">
                <span>{activeAgent?.model || 'No model selected'}</span>
                <span>•</span>
                <span>Ready</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors">
              <Cpu className="w-4 h-4 text-text-medium" />
            </button>
            <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors">
              <MoreVertical className="w-4 h-4 text-text-medium" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-auto scrollbar-custom p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-heading text-text-high mb-2">
              {activeAgent ? `Chat with ${activeAgent.name}` : 'No Agent Selected'}
            </h3>
            <p className="text-body text-text-medium">
              {activeAgent 
                ? `Start a conversation with ${activeAgent.name} powered by ${activeAgent.model}`
                : 'Please select an agent to start chatting'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${
                  message.role === 'user' ? 'ml-3' : 'mr-3'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-surface-2' 
                      : 'bg-primary-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-text-medium" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 ${
                  message.role === 'user' ? 'mr-12' : 'ml-12'
                }`}>
                  <div className={`p-4 rounded-mild ${
                    message.role === 'user'
                      ? 'bg-surface-2 text-text-high'
                      : 'bg-primary-500/10 border border-primary-500/30 text-text-high'
                  }`}>
                    <div className="whitespace-pre-wrap text-body">
                      {message.content}
                    </div>
                    
                    {/* Message Meta */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center space-x-2 text-small text-text-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.model && (
                          <>
                            <span>•</span>
                            <span>{message.model}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-3xl">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 ml-12">
                <div className="p-4 rounded-mild bg-primary-500/10 border border-primary-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-small text-text-medium">
                      {activeAgent?.name || 'Agent'} is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="bg-surface-1 border-t border-border p-4">
        {!activeAgent ? (
          <div className="text-center py-8">
            <p className="text-body text-text-medium">
              Please select an agent from the sidebar to start chatting
            </p>
          </div>
        ) : (
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            <button className="p-2 hover:bg-surface-2 rounded-sharp transition-colors">
              <Paperclip className="w-5 h-5 text-text-medium" />
            </button>
            
            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeAgent.name}...`}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-surface-card border border-border rounded-sharp text-body text-text-high placeholder-text-disabled focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-colors resize-none max-h-32"
                style={{
                  minHeight: '48px',
                  height: `${Math.min(Math.max(textareaRef.current?.scrollHeight || 48, 48), 128)}px`
                }}
              />
              
              {/* Voice Input Button */}
              <button className="absolute right-3 bottom-3 p-1 hover:bg-surface-2 rounded-sharp transition-colors">
                <Mic className="w-4 h-4 text-text-medium" />
              </button>
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-2 disabled:text-text-disabled text-white rounded-sharp transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}