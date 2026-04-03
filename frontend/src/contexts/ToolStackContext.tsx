/**
 * Tool Stack Context
 * Manages multiple open tools, allowing users to pile up and switch between tools
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UIConfig, ContextualUI } from '../components/ContextualUI';

export interface StackedTool {
  id: string;
  config: UIConfig;
  openedAt: Date;
  minimized: boolean;
  zIndex: number;
  // For file context passing between tools
  fileContext?: {
    file?: File;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  };
  // Callback when content is saved from this tool
  onContentSaved?: () => void;
}

interface ToolStackContextType {
  // Stack management
  openTools: StackedTool[];
  activeToolId: string | null;

  // Actions
  openTool: (config: UIConfig, fileContext?: StackedTool['fileContext'], onContentSaved?: () => void) => void;
  closeTool: (toolId: string) => void;
  closeAllTools: () => void;
  focusTool: (toolId: string) => void;
  minimizeTool: (toolId: string) => void;
  restoreTool: (toolId: string) => void;

  // Pass file context to another tool
  switchToToolWithFile: (toolId: string, fileContext: StackedTool['fileContext']) => void;

  // Get file context for a tool
  getFileContext: (toolId: string) => StackedTool['fileContext'] | undefined;

  // Notify that content was saved (triggers refresh callbacks)
  notifyContentSaved: () => void;
}

const ToolStackContext = createContext<ToolStackContextType | undefined>(undefined);

export const useToolStack = () => {
  const context = useContext(ToolStackContext);
  if (!context) {
    throw new Error('useToolStack must be used within a ToolStackProvider');
  }
  return context;
};

interface ToolStackProviderProps {
  children: React.ReactNode;
}

export const ToolStackProvider: React.FC<ToolStackProviderProps> = ({ children }) => {
  const [openTools, setOpenTools] = useState<StackedTool[]>([]);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  const openTool = useCallback((config: UIConfig, fileContext?: StackedTool['fileContext'], onContentSaved?: () => void) => {
    const toolId = config.toolId || `tool-${Date.now()}`;

    // Check if tool is already open
    const existingTool = openTools.find(t => t.config.toolId === config.toolId);
    if (existingTool) {
      // Just focus it and update the callback
      setActiveToolId(existingTool.id);
      setOpenTools(prev => prev.map(t =>
        t.id === existingTool.id
          ? { ...t, zIndex: nextZIndex, minimized: false, fileContext: fileContext || t.fileContext, onContentSaved: onContentSaved || t.onContentSaved }
          : t
      ));
      setNextZIndex(prev => prev + 1);
      return;
    }

    const newTool: StackedTool = {
      id: toolId,
      config,
      openedAt: new Date(),
      minimized: false,
      zIndex: nextZIndex,
      fileContext,
      onContentSaved,
    };

    setOpenTools(prev => [...prev, newTool]);
    setActiveToolId(toolId);
    setNextZIndex(prev => prev + 1);
  }, [openTools, nextZIndex]);

  const closeTool = useCallback((toolId: string) => {
    setOpenTools(prev => {
      const newTools = prev.filter(t => t.id !== toolId);
      // Set active to last tool if we're closing the active one
      if (activeToolId === toolId && newTools.length > 0) {
        const lastTool = newTools[newTools.length - 1];
        setActiveToolId(lastTool.id);
      } else if (newTools.length === 0) {
        setActiveToolId(null);
      }
      return newTools;
    });
  }, [activeToolId]);

  const closeAllTools = useCallback(() => {
    setOpenTools([]);
    setActiveToolId(null);
  }, []);

  const focusTool = useCallback((toolId: string) => {
    setActiveToolId(toolId);
    setOpenTools(prev => prev.map(t =>
      t.id === toolId
        ? { ...t, zIndex: nextZIndex, minimized: false }
        : t
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const minimizeTool = useCallback((toolId: string) => {
    setOpenTools(prev => prev.map(t =>
      t.id === toolId ? { ...t, minimized: true } : t
    ));
    // Focus next non-minimized tool
    const nonMinimized = openTools.filter(t => t.id !== toolId && !t.minimized);
    if (nonMinimized.length > 0) {
      setActiveToolId(nonMinimized[nonMinimized.length - 1].id);
    }
  }, [openTools]);

  const restoreTool = useCallback((toolId: string) => {
    setOpenTools(prev => prev.map(t =>
      t.id === toolId
        ? { ...t, minimized: false, zIndex: nextZIndex }
        : t
    ));
    setActiveToolId(toolId);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const switchToToolWithFile = useCallback((toolId: string, fileContext: StackedTool['fileContext']) => {
    // Find the tool or open a new one
    const existingTool = openTools.find(t => t.config.toolId === toolId);
    if (existingTool) {
      setOpenTools(prev => prev.map(t =>
        t.id === existingTool.id
          ? { ...t, fileContext, zIndex: nextZIndex, minimized: false }
          : t
      ));
      setActiveToolId(existingTool.id);
      setNextZIndex(prev => prev + 1);
    } else {
      // Open new tool with file context - config will be provided by caller
      console.log('Tool not open, needs to be opened with config');
    }
  }, [openTools, nextZIndex]);

  const getFileContext = useCallback((toolId: string) => {
    const tool = openTools.find(t => t.id === toolId);
    return tool?.fileContext;
  }, [openTools]);

  // Notify that content was saved - calls all registered callbacks
  const notifyContentSaved = useCallback(() => {
    openTools.forEach(tool => {
      if (tool.onContentSaved) {
        tool.onContentSaved();
      }
    });
  }, [openTools]);

  // Handle closing the active tool
  const handleCloseTool = useCallback(() => {
    if (activeToolId) {
      closeTool(activeToolId);
    }
  }, [activeToolId, closeTool]);

  // Handle opening another tool from within a tool
  const handleOpenToolFromTool = useCallback((config: UIConfig) => {
    openTool(config);
  }, [openTool]);

  // Get the active tool config
  const activeToolConfig = openTools.find(t => t.id === activeToolId)?.config || null;

  return (
    <ToolStackContext.Provider
      value={{
        openTools,
        activeToolId,
        openTool,
        closeTool,
        closeAllTools,
        focusTool,
        minimizeTool,
        restoreTool,
        switchToToolWithFile,
        getFileContext,
        notifyContentSaved,
      }}
    >
      {children}

      {/* Global Tool Renderer - renders tools opened via ToolStackContext */}
      {openTools.length > 0 && activeToolConfig && (
        <ContextualUI
          intent={{
            uiConfig: activeToolConfig
          }}
          onClose={handleCloseTool}
          onOpenTool={handleOpenToolFromTool}
        />
      )}

      {/* Tool stack indicator when multiple tools open */}
      {openTools.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#1a1a1a]/95 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {openTools.length} tools open
          </span>
          <button
            onClick={closeAllTools}
            className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            Close all
          </button>
        </div>
      )}
    </ToolStackContext.Provider>
  );
};
