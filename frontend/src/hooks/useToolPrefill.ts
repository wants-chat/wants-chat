import { useState, useEffect, useCallback } from 'react';

/**
 * Prefill data stored in session storage
 */
export interface StoredPrefillData {
  values: Record<string, any>;
  extractedFields?: Array<{
    fieldName: string;
    value: any;
    confidence: number;
    source: string;
  }>;
  attachmentMappings?: Array<{
    attachmentUrl: string;
    targetField: string;
  }>;
  readinessPercentage?: number;
  timestamp: number;
}

/**
 * Hook to retrieve and manage tool prefill data from session storage
 *
 * This hook allows tools to access pre-filled values that were extracted
 * by the AI from the user's chat message. Tools can use this to automatically
 * populate their form fields.
 *
 * @param toolId - The ID of the tool to get prefill data for
 * @returns Object containing prefill values and helper functions
 */
export function useToolPrefill(toolId: string) {
  const [prefillData, setPrefillData] = useState<StoredPrefillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load prefill data from session storage on mount
  useEffect(() => {
    if (!toolId) {
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = `tool_prefill_${toolId}`;
      const storedData = sessionStorage.getItem(storageKey);

      if (storedData) {
        const parsed = JSON.parse(storedData) as StoredPrefillData;

        // Check if data is not too old (15 minutes max)
        const maxAge = 15 * 60 * 1000; // 15 minutes
        if (Date.now() - parsed.timestamp < maxAge) {
          setPrefillData(parsed);
        } else {
          // Clear old data
          sessionStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error loading tool prefill data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toolId]);

  /**
   * Get a specific prefill value by field name
   */
  const getValue = useCallback(<T = any>(fieldName: string, defaultValue?: T): T | undefined => {
    if (!prefillData?.values) return defaultValue;
    return prefillData.values[fieldName] ?? defaultValue;
  }, [prefillData]);

  /**
   * Get all prefill values as an object
   */
  const getValues = useCallback((): Record<string, any> => {
    return prefillData?.values || {};
  }, [prefillData]);

  /**
   * Get extracted field metadata (includes confidence scores)
   */
  const getExtractedFields = useCallback(() => {
    return prefillData?.extractedFields || [];
  }, [prefillData]);

  /**
   * Get a specific field's confidence score (0-1)
   */
  const getFieldConfidence = useCallback((fieldName: string): number => {
    const field = prefillData?.extractedFields?.find(f => f.fieldName === fieldName);
    return field?.confidence ?? 0;
  }, [prefillData]);

  /**
   * Get attachment mappings for file fields
   */
  const getAttachmentMappings = useCallback(() => {
    return prefillData?.attachmentMappings || [];
  }, [prefillData]);

  /**
   * Get the overall readiness percentage
   */
  const getReadinessPercentage = useCallback((): number => {
    return prefillData?.readinessPercentage ?? 0;
  }, [prefillData]);

  /**
   * Clear the prefill data from session storage
   */
  const clearPrefill = useCallback(() => {
    if (toolId) {
      sessionStorage.removeItem(`tool_prefill_${toolId}`);
      setPrefillData(null);
    }
  }, [toolId]);

  /**
   * Check if there is any prefill data available
   */
  const hasPrefill = Boolean(prefillData?.values && Object.keys(prefillData.values).length > 0);

  return {
    // State
    isLoading,
    hasPrefill,
    prefillData,

    // Getters
    getValue,
    getValues,
    getExtractedFields,
    getFieldConfidence,
    getAttachmentMappings,
    getReadinessPercentage,

    // Actions
    clearPrefill,
  };
}

/**
 * Utility function to manually store prefill data for a tool
 * (Used by the chat page when clicking on tool chips)
 */
export function storeToolPrefill(
  toolId: string,
  values: Record<string, any>,
  options?: {
    extractedFields?: StoredPrefillData['extractedFields'];
    attachmentMappings?: StoredPrefillData['attachmentMappings'];
    readinessPercentage?: number;
  }
): void {
  const data: StoredPrefillData = {
    values,
    extractedFields: options?.extractedFields,
    attachmentMappings: options?.attachmentMappings,
    readinessPercentage: options?.readinessPercentage,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(`tool_prefill_${toolId}`, JSON.stringify(data));
}

/**
 * Utility function to clear all tool prefill data
 */
export function clearAllToolPrefills(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith('tool_prefill_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

export default useToolPrefill;
