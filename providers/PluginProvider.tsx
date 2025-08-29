import React, { createContext, useContext, useState, useCallback } from 'react';
import { Node, Edge } from '../types';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  hooks: {
    onNodeCreate?: (node: Node) => Node;
    onNodeUpdate?: (node: Node, changes: Partial<Node>) => Node;
    onNodeDelete?: (node: Node) => boolean; // return false to prevent deletion
    onEdgeCreate?: (edge: Edge) => Edge;
    onEdgeUpdate?: (edge: Edge, changes: Partial<Edge>) => Edge;
    onEdgeDelete?: (edge: Edge) => boolean; // return false to prevent deletion
    onCanvasRender?: (nodes: Node[], edges: Edge[]) => void;
  };
  components?: {
    [key: string]: React.ComponentType<any>;
  };
  tools?: {
    [key: string]: {
      name: string;
      icon: React.ReactNode;
      action: (context: PluginContext) => void;
    };
  };
}

interface PluginContext {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
}

interface PluginContextType {
  plugins: Plugin[];
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
  getEnabledPlugins: () => Plugin[];
  executeHook: (hookName: keyof Plugin['hooks'], ...args: any[]) => any;
  getPluginTools: () => Plugin['tools'];
  getPluginComponents: () => { [key: string]: React.ComponentType<any> };
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

interface PluginProviderProps {
  children: React.ReactNode;
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  const registerPlugin = useCallback((plugin: Plugin) => {
    setPlugins(prev => {
      const existing = prev.find(p => p.id === plugin.id);
      if (existing) {
        // Update existing plugin
        return prev.map(p => p.id === plugin.id ? plugin : p);
      } else {
        // Add new plugin
        return [...prev, plugin];
      }
    });
  }, []);

  const unregisterPlugin = useCallback((pluginId: string) => {
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
  }, []);

  const enablePlugin = useCallback((pluginId: string) => {
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, enabled: true } : p
    ));
  }, []);

  const disablePlugin = useCallback((pluginId: string) => {
    setPlugins(prev => prev.map(p => 
      p.id === pluginId ? { ...p, enabled: false } : p
    ));
  }, []);

  const getEnabledPlugins = useCallback(() => {
    return plugins.filter(p => p.enabled);
  }, [plugins]);

  const executeHook = useCallback((hookName: keyof Plugin['hooks'], ...args: any[]) => {
    const enabledPlugins = getEnabledPlugins();
    let result = args[0]; // First argument is usually the target object
    
    for (const plugin of enabledPlugins) {
      const hook = plugin.hooks[hookName];
      if (hook) {
        try {
          const hookResult = hook(...args);
          if (hookResult !== undefined) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`Error executing hook ${hookName} for plugin ${plugin.id}:`, error);
        }
      }
    }
    
    return result;
  }, [getEnabledPlugins]);

  const getPluginTools = useCallback(() => {
    const enabledPlugins = getEnabledPlugins();
    return enabledPlugins.reduce((acc, plugin) => {
      if (plugin.tools) {
        return { ...acc, ...plugin.tools };
      }
      return acc;
    }, {});
  }, [getEnabledPlugins]);

  const getPluginComponents = useCallback(() => {
    const enabledPlugins = getEnabledPlugins();
    return enabledPlugins.reduce((acc, plugin) => {
      if (plugin.components) {
        return { ...acc, ...plugin.components };
      }
      return acc;
    }, {});
  }, [getEnabledPlugins]);

  const value: PluginContextType = {
    plugins,
    registerPlugin,
    unregisterPlugin,
    enablePlugin,
    disablePlugin,
    getEnabledPlugins,
    executeHook,
    getPluginTools,
    getPluginComponents
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugin = (): PluginContextType => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }
  return context;
};

// Helper function to create plugins
export const createPlugin = (config: Omit<Plugin, 'id'> & { id?: string }): Plugin => {
  return {
    id: config.id || `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    enabled: true,
    hooks: {},
    components: {},
    tools: {},
    ...config
  };
};