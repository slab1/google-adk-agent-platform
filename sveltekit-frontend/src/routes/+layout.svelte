<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { 
    uiState, 
    storeActions, 
    initializeSampleData,
    isConnected,
    connectionStatus,
    errors 
  } from '$stores';
  import Sidebar from '$components/Sidebar.svelte';
  import Header from '$components/Header.svelte';
  import ErrorToast from '$components/ErrorToast.svelte';
  import { Zap, Wifi, WifiOff } from 'lucide-svelte';

  let { children } = $props();

  // Initialize sample data on mount
  onMount(() => {
    initializeSampleData();
  });

  // Connection status styling
  $: connectionIcon = $connectionStatus === 'connected' ? Wifi : 
                     $connectionStatus === 'connecting' ? Zap : WifiOff;
  $: connectionColor = $connectionStatus === 'connected' ? 'text-success' : 
                      $connectionStatus === 'connecting' ? 'text-warning' : 'text-error';
</script>

<svelte:head>
  <title>Google ADK Agent Platform</title>
  <meta name="description" content="AI Agent Development Platform with Visual Workflow Builder and Analytics" />
</svelte:head>

<div class="h-screen flex bg-background text-text-high font-sans">
  <!-- Sidebar -->
  <Sidebar />
  
  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Header -->
    <Header />
    
    <!-- Main Canvas -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Center Content -->
      <main class="flex-1 overflow-auto scrollbar-custom">
        {@render children()}
      </main>
      
      <!-- Right Panel - Collapsible Properties Panel -->
      {#if !$uiState.rightPanelCollapsed}
        <aside class="w-80 bg-surface-1 border-l border-border p-6 overflow-auto scrollbar-custom">
          <div class="space-y-6">
            <h3 class="text-subheading text-text-high">Properties</h3>
            
            <!-- Context-aware properties panel -->
            {#if $uiState.activeView === 'builder' && $uiState.selectedWorkflow}
              <div class="space-y-4">
                <div>
                  <label class="text-small text-text-medium uppercase tracking-wide">
                    Workflow Settings
                  </label>
                  <div class="mt-1 p-3 bg-surface-card rounded-sharp border border-border space-y-2">
                    <input 
                      type="text" 
                      placeholder="Workflow name" 
                      class="form-input w-full text-sm"
                    />
                    <textarea 
                      placeholder="Description"
                      rows="2"
                      class="form-textarea w-full text-sm"
                    ></textarea>
                    <button class="btn-primary w-full text-sm">Update Workflow</button>
                  </div>
                </div>
              </div>
            {:else if $uiState.activeView === 'analytics'}
              <div class="space-y-4">
                <div>
                  <label class="text-small text-text-medium uppercase tracking-wide">
                    Quick Stats
                  </label>
                  <div class="mt-1 space-y-3">
                    <div class="flex justify-between text-body">
                      <span class="text-text-medium">Response Time</span>
                      <span class="text-text-high font-mono">1.4s</span>
                    </div>
                    <div class="flex justify-between text-body">
                      <span class="text-text-medium">Success Rate</span>
                      <span class="text-text-high font-mono">94.2%</span>
                    </div>
                    <div class="flex justify-between text-body">
                      <span class="text-text-medium">Active Users</span>
                      <span class="text-text-high font-mono">89</span>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="space-y-4">
                <div>
                  <label class="text-small text-text-medium uppercase tracking-wide">
                    Selected Item
                  </label>
                  <div class="mt-1 p-3 bg-surface-card rounded-sharp border border-border">
                    <div class="text-body text-text-high">No item selected</div>
                    <div class="text-small text-text-medium mt-1">
                      Select an item to view properties
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </aside>
      {/if}
      
      <!-- Right Panel Toggle -->
      <button
        onclick={() => storeActions.toggleRightPanel()}
        class="w-6 bg-surface-1 border-l border-border flex items-center justify-center hover:bg-surface-2 transition-colors"
        title="Toggle Properties Panel"
      >
        <div class="w-1 h-8 bg-border rounded-full"></div>
      </button>
    </div>
    
    <!-- Status Bar -->
    <footer class="h-8 bg-surface-1 border-t border-border flex items-center px-4 text-small text-text-medium">
      <div class="flex items-center space-x-4">
        <span>Google ADK Agent Platform v2.0.0</span>
        <span class="text-text-disabled">•</span>
        
        <!-- Connection Status -->
        <div class="flex items-center space-x-2">
          <svelte:component this={connectionIcon} class="w-4 h-4 {connectionColor}" />
          <span class="capitalize">{$connectionStatus}</span>
        </div>
      </div>
      
      <div class="flex-1"></div>
      
      <div class="flex items-center space-x-4">
        <span class="text-text-medium">Models: {Math.max(1, Math.floor(Math.random() * 5))}</span>
        <span class="text-text-disabled">•</span>
        <span class="text-text-medium">Agents: {Math.max(1, Math.floor(Math.random() * 10))}</span>
        <span class="text-text-disabled">•</span>
        <span class="text-text-medium">Workflows: {Math.max(1, Math.floor(Math.random() * 3))}</span>
      </div>
    </footer>
  </div>
</div>

<!-- Error Toast Notifications -->
{#if $errors.length > 0}
  <div class="fixed top-4 right-4 z-50 space-y-2">
    {#each $errors as error, index}
      <ErrorToast 
        message={error} 
        onClose={() => storeActions.removeError(index)} 
      />
    {/each}
  </div>
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>