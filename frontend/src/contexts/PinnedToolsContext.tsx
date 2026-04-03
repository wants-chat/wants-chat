import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PinnedTool {
  toolId: string;
  title: string;
  description: string;
  icon?: string;
  type: string;
  pinnedAt: string;
}

interface PinnedToolsContextType {
  pinnedTools: PinnedTool[];
  pinTool: (tool: Omit<PinnedTool, 'pinnedAt'>) => void;
  unpinTool: (toolId: string) => void;
  isPinned: (toolId: string) => boolean;
  reorderTools: (fromIndex: number, toIndex: number) => void;
  clearPinnedTools: () => void;
}

const PinnedToolsContext = createContext<PinnedToolsContextType | undefined>(undefined);

const STORAGE_KEY = 'wants_pinned_tools';

export const PinnedToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedTools, setPinnedTools] = useState<PinnedTool[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedTools));
  }, [pinnedTools]);

  const pinTool = useCallback((tool: Omit<PinnedTool, 'pinnedAt'>) => {
    setPinnedTools(prev => {
      // Check if already pinned
      if (prev.some(t => t.toolId === tool.toolId)) {
        return prev;
      }
      return [...prev, { ...tool, pinnedAt: new Date().toISOString() }];
    });
  }, []);

  const unpinTool = useCallback((toolId: string) => {
    setPinnedTools(prev => prev.filter(t => t.toolId !== toolId));
  }, []);

  const isPinned = useCallback((toolId: string) => {
    return pinnedTools.some(t => t.toolId === toolId);
  }, [pinnedTools]);

  const reorderTools = useCallback((fromIndex: number, toIndex: number) => {
    setPinnedTools(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const clearPinnedTools = useCallback(() => {
    setPinnedTools([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PinnedToolsContext.Provider value={{ pinnedTools, pinTool, unpinTool, isPinned, reorderTools, clearPinnedTools }}>
      {children}
    </PinnedToolsContext.Provider>
  );
};

export const usePinnedTools = () => {
  const context = useContext(PinnedToolsContext);
  if (!context) {
    throw new Error('usePinnedTools must be used within a PinnedToolsProvider');
  }
  return context;
};
