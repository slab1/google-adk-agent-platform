import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  icon: string;
  screenshots: string[];
  rating: number;
  downloads: number;
  price: number;
  isInstalled: boolean;
  isActive: boolean;
  dependencies: string[];
  configSchema: any;
  readme: string;
  changelog: string;
  repository?: string;
  homepage?: string;
  license: string;
  publishedAt: string;
  updatedAt: string;
}

export interface PluginConfig {
  pluginId: string;
  config: Record<string, any>;
  enabled: boolean;
  installedAt: string;
}

export interface PluginMarketplaceItem extends Plugin {
  marketplaceInfo: {
    verified: boolean;
    featured: boolean;
    trending: boolean;
    new: boolean;
    category: string;
    subcategory?: string;
  };
}

// Plugin State
interface PluginState {
  availablePlugins: PluginMarketplaceItem[];
  installedPlugins: PluginConfig[];
  activePlugins: string[];
  pluginCategories: string[];
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  installationProgress: Record<string, number>;
}

// Plugin Actions
interface PluginActions {
  // Marketplace actions
  loadMarketplace: () => Promise<void>;
  searchPlugins: (query: string) => void;
  filterByCategory: (category: string) => void;
  
  // Installation actions
  installPlugin: (pluginId: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  activatePlugin: (pluginId: string) => Promise<void>;
  deactivatePlugin: (pluginId: string) => Promise<void>;
  
  // Configuration actions
  updatePluginConfig: (pluginId: string, config: Record<string, any>) => Promise<void>;
  getPluginConfig: (pluginId: string) => Promise<PluginConfig | null>;
  
  // Utility actions
  clearError: () => void;
  refreshPlugins: () => Promise<void>;
}

// Create plugin state store
const createPluginState = (): Writable<PluginState> => {
  return writable<PluginState>({
    availablePlugins: [],
    installedPlugins: [],
    activePlugins: [],
    pluginCategories: [],
    searchQuery: '',
    selectedCategory: 'all',
    isLoading: false,
    error: null,
    installationProgress: {}
  });
};

export const pluginState = createPluginState();

// Create plugin actions store
const createPluginActions = (): Writable<PluginActions> => {
  return writable<PluginActions>({
    loadMarketplace: async () => {},
    searchPlugins: (query: string) => {},
    filterByCategory: (category: string) => {},
    installPlugin: async (pluginId: string) => {},
    uninstallPlugin: async (pluginId: string) => {},
    activatePlugin: async (pluginId: string) => {},
    deactivatePlugin: async (pluginId: string) => {},
    updatePluginConfig: async (pluginId: string, config: Record<string, any>) => {},
    getPluginConfig: async (pluginId: string) => null,
    clearError: () => {},
    refreshPlugins: async () => {}
  });
};

export const pluginActions = createPluginActions();

// Derived stores
export const installedPlugins: Readable<PluginMarketplaceItem[]> = derived(
  [pluginState],
  ([$pluginState]) => {
    return $pluginState.availablePlugins.filter(plugin => plugin.isInstalled);
  }
);

export const activePlugins: Readable<PluginMarketplaceItem[]> = derived(
  [pluginState],
  ([$pluginState]) => {
    return $pluginState.availablePlugins.filter(plugin => 
      plugin.isInstalled && plugin.isActive
    );
  }
);

export const filteredPlugins: Readable<PluginMarketplaceItem[]> = derived(
  [pluginState],
  ([$pluginState]) => {
    let plugins = $pluginState.availablePlugins;
    
    // Apply search filter
    if ($pluginState.searchQuery.trim()) {
      const query = $pluginState.searchQuery.toLowerCase();
      plugins = plugins.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if ($pluginState.selectedCategory !== 'all') {
      plugins = plugins.filter(plugin => 
        plugin.category.toLowerCase() === $pluginState.selectedCategory.toLowerCase()
      );
    }
    
    return plugins;
  }
);

export const pluginCategories: Readable<string[]> = derived(
  [pluginState],
  ([$pluginState]) => $pluginState.pluginCategories
);

// Initialize plugin actions
const initializePluginActions = () => {
  const actions: PluginActions = {
    loadMarketplace: async () => {
      pluginState.update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await fetch('/api/plugins/marketplace');
        if (!response.ok) {
          throw new Error(`Failed to load marketplace: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        pluginState.update(state => ({
          ...state,
          availablePlugins: data.plugins || [],
          pluginCategories: data.categories || [],
          isLoading: false
        }));
      } catch (error) {
        pluginState.update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false
        }));
      }
    },

    searchPlugins: (query: string) => {
      pluginState.update(state => ({
        ...state,
        searchQuery: query
      }));
    },

    filterByCategory: (category: string) => {
      pluginState.update(state => ({
        ...state,
        selectedCategory: category
      }));
    },

    installPlugin: async (pluginId: string) => {
      pluginState.update(state => ({
        ...state,
        installationProgress: {
          ...state.installationProgress,
          [pluginId]: 0
        }
      }));
      
      try {
        // Simulate installation progress
        const progressInterval = setInterval(() => {
          pluginState.update(state => {
            const currentProgress = state.installationProgress[pluginId] || 0;
            if (currentProgress < 90) {
              return {
                ...state,
                installationProgress: {
                  ...state.installationProgress,
                  [pluginId]: currentProgress + 10
                }
              };
            }
            return state;
          });
        }, 200);

        const response = await fetch('/api/plugins/install', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pluginId })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`Installation failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        pluginState.update(state => ({
          ...state,
          installationProgress: {
            ...state.installationProgress,
            [pluginId]: 100
          },
          availablePlugins: state.availablePlugins.map(plugin =>
            plugin.id === pluginId
              ? { ...plugin, isInstalled: true }
              : plugin
          )
        }));

        // Clear progress after a delay
        setTimeout(() => {
          pluginState.update(state => {
            const newProgress = { ...state.installationProgress };
            delete newProgress[pluginId];
            return {
              ...state,
              installationProgress: newProgress
            };
          });
        }, 1000);

      } catch (error) {
        pluginState.update(state => ({
          ...state,
          installationProgress: {
            ...state.installationProgress,
            [pluginId]: 0
          },
          error: error instanceof Error ? error.message : 'Installation failed'
        }));
      }
    },

    uninstallPlugin: async (pluginId: string) => {
      try {
        const response = await fetch(`/api/plugins/${pluginId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Uninstallation failed: ${response.statusText}`);
        }

        pluginState.update(state => ({
          ...state,
          availablePlugins: state.availablePlugins.map(plugin =>
            plugin.id === pluginId
              ? { ...plugin, isInstalled: false, isActive: false }
              : plugin
          )
        }));

      } catch (error) {
        pluginState.update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Uninstallation failed'
        }));
      }
    },

    activatePlugin: async (pluginId: string) => {
      try {
        const response = await fetch(`/api/plugins/${pluginId}/activate`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error(`Activation failed: ${response.statusText}`);
        }

        pluginState.update(state => ({
          ...state,
          availablePlugins: state.availablePlugins.map(plugin =>
            plugin.id === pluginId
              ? { ...plugin, isActive: true }
              : plugin
          )
        }));

      } catch (error) {
        pluginState.update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Activation failed'
        }));
      }
    },

    deactivatePlugin: async (pluginId: string) => {
      try {
        const response = await fetch(`/api/plugins/${pluginId}/deactivate`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error(`Deactivation failed: ${response.statusText}`);
        }

        pluginState.update(state => ({
          ...state,
          availablePlugins: state.availablePlugins.map(plugin =>
            plugin.id === pluginId
              ? { ...plugin, isActive: false }
              : plugin
          )
        }));

      } catch (error) {
        pluginState.update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Deactivation failed'
        }));
      }
    },

    updatePluginConfig: async (pluginId: string, config: Record<string, any>) => {
      try {
        const response = await fetch(`/api/plugins/${pluginId}/config`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ config })
        });

        if (!response.ok) {
          throw new Error(`Configuration update failed: ${response.statusText}`);
        }

      } catch (error) {
        pluginState.update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Configuration update failed'
        }));
        throw error;
      }
    },

    getPluginConfig: async (pluginId: string) => {
      try {
        const response = await fetch(`/api/plugins/${pluginId}/config`);
        
        if (!response.ok) {
          return null;
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to get plugin config:', error);
        return null;
      }
    },

    clearError: () => {
      pluginState.update(state => ({
        ...state,
        error: null
      }));
    },

    refreshPlugins: async () => {
      await actions.loadMarketplace();
    }
  };

  pluginActions.set(actions);
  return actions;
};

// Initialize actions
export const pluginStoreActions = initializePluginActions();

// Load initial data
if (typeof window !== 'undefined') {
  pluginStoreActions.loadMarketplace();
}