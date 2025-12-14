<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { 
    currentAgent, 
    chatHistory, 
    agents, 
    isTyping,
    storeActions 
  } from '$stores';
  import { 
    Send, 
    Bot, 
    User, 
    Settings, 
    Plus, 
    MoreVertical,
    Paperclip,
    Smile,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Download,
    Trash2
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let selectedAgent = $state<string>('');
  let messageInput = $state('');
  let messagesContainer: HTMLElement;
  let isLoading = $state(false);
  let selectedMessages = new Set<string>();

  const messageStatuses = {
    sent: { icon: CheckCircle2, color: 'text-success', label: 'Sent' },
    delivered: { icon: CheckCircle2, color: 'text-success', label: 'Delivered' },
    failed: { icon: XCircle, color: 'text-error', label: 'Failed' },
    sending: { icon: Clock, color: 'text-warning', label: 'Sending...' },
    reading: { icon: Clock, color: 'text-info', label: 'Reading' }
  };

  // Sample chat history
  const sampleMessages = $state([
    {
      id: '1',
      role: 'user',
      content: 'Hello! Can you help me build a customer support bot?',
      timestamp: new Date(Date.now() - 60000 * 30),
      status: 'delivered' as const
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I\'d be happy to help you build a customer support bot! I can guide you through the process step by step. Let me create a comprehensive workflow for you.',
      timestamp: new Date(Date.now() - 60000 * 25),
      status: 'delivered' as const
    },
    {
      id: '3',
      role: 'user',
      content: 'That sounds great! What are the first steps?',
      timestamp: new Date(Date.now() - 60000 * 20),
      status: 'delivered' as const
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Let me walk you through the workflow builder. You can start by going to the builder tab and creating a new workflow with the customer support template.',
      timestamp: new Date(Date.now() - 60000 * 15),
      status: 'delivered' as const
    },
    {
      id: '5',
      role: 'user',
      content: 'Perfect! I\'ll try that out. Thanks for the help!',
      timestamp: new Date(Date.now() - 60000 * 10),
      status: 'delivered' as const
    },
    {
      id: '6',
      role: 'assistant',
      content: 'You\'re welcome! Feel free to come back if you need any assistance with the implementation.',
      timestamp: new Date(Date.now() - 60000 * 5),
      status: 'delivered' as const
    }
  ]);

  // Simulate real-time message updates
  onMount(() => {
    // Set default agent
    if ($agents.length > 0) {
      selectedAgent = $agents[0].id;
    }

    // Simulate typing indicator
    const typingInterval = setInterval(() => {
      if (isLoading) {
        storeActions.setTyping(false);
      }
    }, 3000);

    return () => clearInterval(typingInterval);
  });

  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: messageInput.trim(),
      timestamp: new Date(),
      status: 'sending' as const
    };

    sampleMessages.push(userMessage);
    messageInput = '';
    isLoading = true;
    storeActions.setTyping(true);

    // Scroll to bottom
    await tick();
    scrollToBottom();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user message status
      const messageIndex = sampleMessages.findIndex(m => m.id === userMessage.id);
      if (messageIndex !== -1) {
        sampleMessages[messageIndex].status = 'delivered';
      }

      // Add assistant response
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: generateResponse(userMessage.content),
        timestamp: new Date(),
        status: 'delivered' as const
      };

      sampleMessages.push(assistantMessage);
      storeActions.setTyping(false);
      isLoading = false;

      await tick();
      scrollToBottom();

    } catch (error) {
      // Update user message status to failed
      const messageIndex = sampleMessages.findIndex(m => m.id === userMessage.id);
      if (messageIndex !== -1) {
        sampleMessages[messageIndex].status = 'failed';
      }
      storeActions.setTyping(false);
      isLoading = false;
      storeActions.addError('Failed to send message');
    }
  };

  const generateResponse = (userMessage: string): string => {
    const responses = [
      "I understand your request. Let me help you with that!",
      "That's a great question. Let me provide you with more details.",
      "I can definitely assist you with that. Here's what I recommend:",
      "Thanks for your message! Let me walk you through the solution.",
      "I'm here to help! Let me guide you through this step by step.",
      "That sounds like an interesting project. Let me suggest the best approach.",
      "I appreciate you reaching out. Here's how we can proceed:",
      "Let me help you with that. I have some ideas that might work well for your needs."
    ];
    
    // Simple keyword-based response generation
    if (userMessage.toLowerCase().includes('workflow')) {
      return "For workflow creation, I recommend starting with our visual workflow builder. You can drag and drop nodes to create complex agent logic.";
    } else if (userMessage.toLowerCase().includes('model')) {
      return "We support multiple AI models including MiniMax-M2, GPT-4, and Claude. You can configure them in the settings panel.";
    } else if (userMessage.toLowerCase().includes('deploy') || userMessage.toLowerCase().includes('production')) {
      return "For deployment, we offer multiple options including Docker containers and Kubernetes. Let me show you the deployment guide.";
    } else if (userMessage.toLowerCase().includes('agent')) {
      return "Agents are the core components of your AI workflows. Each agent can be configured with specific models and tools.";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      sampleMessages.length = 0;
    }
  };

  const exportChat = () => {
    const chatText = sampleMessages.map(msg => 
      `[${formatTime(msg.timestamp)}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMessageSelection = (messageId: string) => {
    if (selectedMessages.has(messageId)) {
      selectedMessages.delete(messageId);
    } else {
      selectedMessages.add(messageId);
    }
    selectedMessages = new Set(selectedMessages);
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === sampleMessages.length) {
      selectedMessages.clear();
    } else {
      sampleMessages.forEach(msg => selectedMessages.add(msg.id));
    }
    selectedMessages = new Set(selectedMessages);
  };
</script>

<svelte:head>
  <title>Chat - Google ADK Agent Platform</title>
</svelte:head>

<div class="h-full flex flex-col">
  <!-- Header -->
  <div class="h-16 bg-surface-1 border-b border-border flex items-center justify-between px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-heading text-text-high">Chat Interface</h1>
      {#if selectedAgent}
        <div class="flex items-center space-x-2 px-3 py-1 bg-surface-2 rounded-sharp">
          <Bot class="w-4 h-4 text-primary-500" />
          <span class="text-small text-text-medium">{$agents.find(a => a.id === selectedAgent)?.name || 'Unknown Agent'}</span>
        </div>
      {/if}
    </div>
    
    <div class="flex items-center space-x-2">
      <button
        onclick={exportChat}
        class="btn-secondary text-sm"
        title="Export chat"
      >
        <Download class="w-4 h-4 mr-2" />
        Export
      </button>
      <button
        onclick={clearChat}
        class="btn-secondary text-sm text-error"
        title="Clear chat"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Clear
      </button>
      <button
        onclick={() => goto('/builder')}
        class="btn-primary text-sm"
      >
        <Plus class="w-4 h-4 mr-2" />
        New Workflow
      </button>
    </div>
  </div>

  <!-- Messages Area -->
  <div class="flex-1 flex">
    <!-- Agent Selection Sidebar -->
    <div class="w-64 bg-surface-1 border-r border-border p-4">
      <h2 class="text-body font-medium text-text-high mb-4">Agents</h2>
      
      <div class="space-y-2">
        {#each $agents as agent}
          <button
            onclick={() => selectedAgent = agent.id}
            class="w-full p-3 rounded-sharp border border-border text-left hover:border-primary-500 transition-colors {selectedAgent === agent.id ? 'bg-primary-500/10 border-primary-500' : ''}"
          >
            <div class="flex items-center space-x-2">
              <Bot class="w-4 h-4 text-primary-500" />
              <div class="flex-1 min-w-0">
                <div class="text-small font-medium text-text-high truncate">{agent.name}</div>
                <div class="text-small text-text-medium">{agent.status}</div>
              </div>
            </div>
          </button>
        {/each}
        
        <button
          onclick={() => goto('/builder')}
          class="w-full p-3 border-2 border-dashed border-border rounded-sharp text-center hover:border-primary-500 transition-colors"
        >
          <Plus class="w-4 h-4 mx-auto text-text-medium mb-1" />
          <div class="text-small text-text-medium">Create Agent</div>
        </button>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 flex flex-col">
      <!-- Message List -->
      <div 
        bind:this={messagesContainer}
        class="flex-1 overflow-auto p-4 space-y-4"
      >
        {#if sampleMessages.length === 0}
          <div class="flex items-center justify-center h-full text-center">
            <div>
              <Bot class="w-12 h-12 text-text-medium mx-auto mb-4" />
              <h3 class="text-heading text-text-high mb-2">Welcome to Chat</h3>
              <p class="text-body text-text-medium mb-4">
                Start a conversation with your AI agent assistant
              </p>
              <button
                onclick={() => messageInput = "Hello! Can you help me get started?"}
                class="btn-primary"
              >
                Send First Message
              </button>
            </div>
          </div>
        {:else}
          <!-- Message Selection Controls -->
          {#if selectedMessages.size > 0}
            <div class="bg-surface-1 border border-border rounded-sharp p-3 mb-4 flex items-center justify-between">
              <div class="text-small text-text-medium">
                {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected
              </div>
              <div class="flex space-x-2">
                <button
                  onclick={selectAllMessages}
                  class="btn-secondary text-sm"
                >
                  {selectedMessages.size === sampleMessages.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onclick={() => selectedMessages.clear()}
                  class="btn-secondary text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          {/if}

          {#each sampleMessages as message (message.id)}
            <div 
              class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
            >
              <div class="max-w-2xl flex {message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 {message.role === 'user' ? 'space-x-reverse' : ''}">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center {message.role === 'user' ? 'bg-primary-500' : 'bg-surface-2'}">
                    {#if message.role === 'user'}
                      <User class="w-4 h-4 text-white" />
                    {:else}
                      <Bot class="w-4 h-4 text-primary-500" />
                    {/if}
                  </div>
                </div>

                <!-- Message Content -->
                <div class="flex-1 min-w-0">
                  <div 
                    class="p-3 rounded-sharp {message.role === 'user' ? 'bg-primary-500 text-white ml-4' : 'bg-surface-card border border-border mr-4'}"
                    class:opacity-50={selectedMessages.has(message.id)}
                  >
                    <div class="whitespace-pre-wrap text-body">{message.content}</div>
                    
                    <!-- Message Status and Time -->
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-2">
                        <span class="text-small {message.role === 'user' ? 'text-white/70' : 'text-text-medium'}">
                          {formatTime(message.timestamp)}
                        </span>
                        {#if message.role === 'user'}
                          {#if messageStatuses[message.status]}
                            <svelte:component 
                              this={messageStatuses[message.status].icon} 
                              class="w-4 h-4 {messageStatuses[message.status].color}"
                            />
                          {/if}
                        {/if}
                      </div>
                      
                      <button
                        onclick={() => toggleMessageSelection(message.id)}
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-2 {selectedMessages.has(message.id) ? 'opacity-100' : ''}"
                        class:bg-primary-500={selectedMessages.has(message.id)}
                        class:bg-surface-2={!selectedMessages.has(message.id)}
                      >
                        <MoreVertical class="w-3 h-3 {selectedMessages.has(message.id) ? 'text-white' : 'text-text-medium'}" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}

          <!-- Typing Indicator -->
          {#if $isTyping}
            <div class="flex justify-start">
              <div class="max-w-2xl flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <Bot class="w-4 h-4 text-primary-500" />
                </div>
                <div class="bg-surface-card border border-border p-3 rounded-sharp mr-4">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-text-medium rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-text-medium rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-text-medium rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Message Input -->
      <div class="border-t border-border p-4">
        <div class="flex items-end space-x-3">
          <div class="flex-1">
            <textarea
              bind:value={messageInput}
              on:keydown={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              rows="1"
              class="form-input resize-none"
              style="min-height: 40px; max-height: 120px;"
              disabled={isLoading}
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              class="btn-secondary p-2"
              title="Attach file"
              disabled={isLoading}
            >
              <Paperclip class="w-4 h-4" />
            </button>
            
            <button
              class="btn-secondary p-2"
              title="Add emoji"
              disabled={isLoading}
            >
              <Smile class="w-4 h-4" />
            </button>
            
            <button
              onclick={sendMessage}
              disabled={!messageInput.trim() || isLoading}
              class="btn-primary p-2 {!messageInput.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
              title="Send message"
            >
              {#if isLoading}
                <RefreshCw class="w-4 h-4 animate-spin" />
              {:else}
                <Send class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>
        
        {#if isLoading}
          <div class="text-small text-text-medium mt-2">
            <Clock class="w-4 h-4 inline mr-1" />
            Sending message...
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>