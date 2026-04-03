/**
 * useToolData Hook
 *
 * A comprehensive React hook for managing tool data with:
 * - Backend API persistence (primary)
 * - localStorage fallback (offline/unauthenticated)
 * - Export to CSV, Excel, JSON, PDF
 * - Import from CSV, JSON
 * - Real-time sync status
 *
 * Usage:
 * ```tsx
 * const {
 *   data,
 *   setData,
 *   addItem,
 *   updateItem,
 *   deleteItem,
 *   exportCSV,
 *   exportExcel,
 *   exportJSON,
 *   exportPDF,
 *   importCSV,
 *   copyToClipboard,
 *   print,
 *   clearData,
 *   isSynced,
 *   isLoading,
 *   lastSaved
 * } = useToolData<BookingType>('room-booking', [], columns);
 * ```
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  parseCSV,
  readFileAsText,
  printData,
  copyToClipboard as copyUtil,
  type ColumnConfig,
  type ExportOptions,
  type PDFExportOptions,
  type ExportResult,
  type ImportResult,
} from '../lib/toolDataUtils';
import { api } from '../lib/api';

// Storage prefix for localStorage fallback
const STORAGE_PREFIX = 'fluxez_tool_';

export interface UseToolDataOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  onSave?: () => void;
  onError?: (error: string) => void;
  onSync?: (synced: boolean) => void;
}

export interface UseToolDataReturn<T> {
  // Data state
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  isLoading: boolean;
  isSaving: boolean;
  isSynced: boolean;
  lastSaved: string | null;
  syncError: string | null;

  // CRUD operations
  addItem: (item: T) => void;
  updateItem: (id: string | number, updates: Partial<T>) => void;
  deleteItem: (id: string | number) => void;
  findItem: (id: string | number) => T | undefined;

  // Export functions
  exportCSV: (options?: ExportOptions) => ExportResult;
  exportExcel: (options?: ExportOptions) => ExportResult;
  exportJSON: (options?: ExportOptions) => ExportResult;
  exportPDF: (options?: PDFExportOptions) => Promise<ExportResult>;

  // Import functions
  importCSV: (file: File) => Promise<ImportResult<T>>;
  importJSON: (file: File) => Promise<ImportResult<T>>;

  // Clipboard & Print
  copyToClipboard: (format?: 'csv' | 'tab' | 'json') => Promise<boolean>;
  print: (title?: string) => void;

  // Data management
  clearData: () => void;
  resetToDefault: (defaultData: T[]) => void;
  forceSync: () => Promise<boolean>;

  // Stats
  recordCount: number;
  version: number;
}

// Check if user is authenticated
function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}

// Save to localStorage
function saveToLocalStorage<T>(toolId: string, data: T[], version: number): void {
  try {
    const storageData = {
      version,
      updatedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(`${STORAGE_PREFIX}${toolId}`, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Load from localStorage
function loadFromLocalStorage<T>(toolId: string): { data: T[]; version: number; updatedAt: string | null } | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${toolId}`);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function useToolData<T extends { id: string | number }>(
  toolId: string,
  defaultData: T[] = [],
  columns: ColumnConfig[],
  options: UseToolDataOptions = {}
): UseToolDataReturn<T> {
  const {
    autoSave = true,
    autoSaveDelay = 3000, // Increased from 1000ms to reduce sync frequency
    onSave,
    onError,
    onSync,
  } = options;

  const [data, setData] = useState<T[]>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [version, setVersion] = useState(1);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastSyncedDataRef = useRef<string>('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setSyncError(null);

      try {
        if (isAuthenticated()) {
          // Try to load from API first
          try {
            const response = await api.get(`/tool-data/${toolId}`);
            if (response.success && response.data) {
              // API has data
              const apiData = Array.isArray(response.data) ? response.data :
                              response.data.items || response.data.data || [];
              setData(apiData);
              setVersion(response.version || 1);
              setLastSaved(response.updatedAt || null);
              setIsSynced(true);
              lastSyncedDataRef.current = JSON.stringify(apiData); // Mark as synced

              // Also save to localStorage for offline access
              saveToLocalStorage(toolId, apiData, response.version || 1);
            } else {
              // No data in API, check localStorage
              const localData = loadFromLocalStorage<T>(toolId);
              if (localData) {
                setData(localData.data);
                setVersion(localData.version);
                setLastSaved(localData.updatedAt);
                lastSyncedDataRef.current = JSON.stringify(localData.data);
                // Sync localStorage data to API
                await syncToApi(localData.data);
              } else {
                setData(defaultData);
                lastSyncedDataRef.current = JSON.stringify(defaultData);
              }
            }
          } catch (apiError) {
            console.warn('API load failed, using localStorage:', apiError);
            // Fall back to localStorage
            const localData = loadFromLocalStorage<T>(toolId);
            if (localData) {
              setData(localData.data);
              setVersion(localData.version);
              setLastSaved(localData.updatedAt);
              lastSyncedDataRef.current = JSON.stringify(localData.data);
            } else {
              setData(defaultData);
              lastSyncedDataRef.current = JSON.stringify(defaultData);
            }
            setIsSynced(false);
            setSyncError('Offline mode - data will sync when online');
          }
        } else {
          // Not authenticated, use localStorage only
          const localData = loadFromLocalStorage<T>(toolId);
          if (localData) {
            setData(localData.data);
            setVersion(localData.version);
            setLastSaved(localData.updatedAt);
            lastSyncedDataRef.current = JSON.stringify(localData.data);
          } else {
            setData(defaultData);
            lastSyncedDataRef.current = JSON.stringify(defaultData);
          }
          setIsSynced(false);
        }
      } catch (error) {
        console.error('Failed to load tool data:', error);
        onError?.('Failed to load data');
        setData(defaultData);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };

    loadData();
  }, [toolId]);

  // Sync to API
  const syncToApi = useCallback(async (dataToSync: T[]): Promise<boolean> => {
    if (!isAuthenticated()) {
      setIsSynced(false);
      return false;
    }

    try {
      setIsSaving(true);
      const response = await api.post(`/tool-data/${toolId}`, {
        data: { items: dataToSync },
      });

      if (response.success) {
        setVersion(response.version || version + 1);
        setLastSaved(response.updatedAt || new Date().toISOString());
        setIsSynced(true);
        setSyncError(null);
        onSave?.();
        onSync?.(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sync to API:', error);
      setSyncError('Failed to sync - data saved locally');
      setIsSynced(false);
      onSync?.(false);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toolId, version, onSave, onSync]);

  // Auto-save with debounce
  useEffect(() => {
    if (!autoSave || isLoading || isInitialLoad.current) return;

    // Check if data actually changed
    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSyncedDataRef.current) {
      return; // No change, skip sync
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      // Double-check data hasn't been synced by another effect
      const dataStr = JSON.stringify(data);
      if (dataStr === lastSyncedDataRef.current) {
        return;
      }

      // Always save to localStorage immediately
      const newVersion = version + 1;
      saveToLocalStorage(toolId, data, newVersion);
      setVersion(newVersion);
      setLastSaved(new Date().toISOString());

      // Try to sync to API
      const success = await syncToApi(data);
      if (success) {
        lastSyncedDataRef.current = dataStr;
      }
    }, autoSaveDelay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, autoSave, autoSaveDelay, toolId, isLoading, syncToApi, version]);

  // CRUD Operations
  const addItem = useCallback((item: T) => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string | number, updates: Partial<T>) => {
    setData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string | number) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  const findItem = useCallback((id: string | number) => {
    return data.find(item => item.id === id);
  }, [data]);

  // Export functions
  const exportCSV = useCallback((exportOptions: ExportOptions = {}) => {
    const opts = { filename: toolId, ...exportOptions };
    return exportToCSV(data, columns, opts);
  }, [data, columns, toolId]);

  const exportExcel = useCallback((exportOptions: ExportOptions = {}) => {
    const opts = { filename: toolId, ...exportOptions };
    return exportToExcel(data, columns, opts);
  }, [data, columns, toolId]);

  const exportJSON = useCallback((exportOptions: ExportOptions = {}) => {
    const opts = { filename: toolId, ...exportOptions };
    return exportToJSON(data, opts);
  }, [data, toolId]);

  const exportPDF = useCallback(async (exportOptions: PDFExportOptions = {}) => {
    const opts = { filename: toolId, ...exportOptions };
    return exportToPDF(data, columns, opts);
  }, [data, columns, toolId]);

  // Import functions
  const importCSV = useCallback(async (file: File): Promise<ImportResult<T>> => {
    try {
      const content = await readFileAsText(file);
      const result = parseCSV<T>(content, columns);

      if (result.success && result.data) {
        setData(prev => [...prev, ...result.data!]);
      }

      return result;
    } catch (error) {
      return { success: false, errors: [String(error)] };
    }
  }, [columns]);

  const importJSON = useCallback(async (file: File): Promise<ImportResult<T>> => {
    try {
      const content = await readFileAsText(file);
      const parsed = JSON.parse(content);

      const importedData: T[] = Array.isArray(parsed)
        ? parsed
        : parsed.data?.items || parsed.data || parsed.items || [];

      if (!Array.isArray(importedData)) {
        return { success: false, errors: ['Invalid JSON format: expected array'] };
      }

      setData(prev => [...prev, ...importedData]);
      return { success: true, data: importedData, rowCount: importedData.length };
    } catch (error) {
      return { success: false, errors: [String(error)] };
    }
  }, []);

  // Clipboard
  const copyToClipboard = useCallback(async (format: 'csv' | 'tab' | 'json' = 'tab') => {
    return copyUtil(data, columns, format);
  }, [data, columns]);

  // Print
  const print = useCallback((title?: string) => {
    printData(data, columns, { title: title || toolId });
  }, [data, columns, toolId]);

  // Clear data
  const clearData = useCallback(async () => {
    setData([]);
    localStorage.removeItem(`${STORAGE_PREFIX}${toolId}`);
    setLastSaved(null);
    setVersion(1);

    if (isAuthenticated()) {
      try {
        await api.delete(`/tool-data/${toolId}`);
      } catch (error) {
        console.error('Failed to delete from API:', error);
      }
    }
  }, [toolId]);

  // Reset to default
  const resetToDefault = useCallback((defaultData: T[]) => {
    setData(defaultData);
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    return syncToApi(data);
  }, [syncToApi, data]);

  // Stats
  const recordCount = useMemo(() => data.length, [data]);

  return {
    data,
    setData,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    clearData,
    resetToDefault,
    forceSync,
    recordCount,
    version,
  };
}

export default useToolData;
