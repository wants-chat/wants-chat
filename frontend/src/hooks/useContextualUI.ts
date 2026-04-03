/**
 * useContextualUI Hook
 *
 * This hook provides context-aware form pre-filling and auto-save functionality
 * for all contextual UIs in the wants.chat application.
 *
 * Priority Order (Safety-First):
 * 1. UI History (last form inputs) - Highest priority, 100% confidence
 * 2. Onboarding Data - High priority, user-provided preferences
 * 3. Chat Context - Lowest priority, only shown as suggestions
 *
 * Usage:
 * ```tsx
 * const { context, suggestions, applyContext, saveOnSubmit, loading } = useContextualUI('macro_calculator');
 *
 * // Apply context to form fields
 * useEffect(() => {
 *   if (context.weight) {
 *     setWeight(context.weight.value);
 *   }
 * }, [context]);
 *
 * // Save on form submit
 * const handleSubmit = async (formData) => {
 *   await saveOnSubmit(formData);
 *   // ... rest of submit logic
 * };
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMergedContext,
  saveUIHistory,
  validateChatContext,
  MergedContext,
  ContextField,
  ChatSuggestion,
} from '@/services/contextApi';

export interface UseContextualUIOptions {
  /** Organization ID for team context */
  organizationId?: string;
  /** Project ID for project-specific context */
  projectId?: string;
  /** Whether to auto-load context on mount */
  autoLoad?: boolean;
  /** Callback when context is loaded */
  onContextLoaded?: (context: Record<string, ContextField>) => void;
  /** Callback when save is complete */
  onSaveComplete?: () => void;
}

export interface UseContextualUIReturn {
  /** Pre-filled context values keyed by field name */
  context: Record<string, ContextField>;
  /** Raw values from context (convenience helper) */
  values: Record<string, any>;
  /** Chat-based suggestions that need user confirmation */
  suggestions: ChatSuggestion[];
  /** Whether context is currently loading */
  loading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** How many times this UI has been used */
  usageCount: number;
  /** When this UI was last used */
  lastUsedAt?: string;
  /** Manually refresh context */
  refreshContext: () => Promise<void>;
  /** Apply a suggestion to the form (marks as validated) */
  applySuggestion: (suggestion: ChatSuggestion) => Promise<void>;
  /** Dismiss a suggestion (marks as invalid) */
  dismissSuggestion: (suggestion: ChatSuggestion) => Promise<void>;
  /** Save form data to UI history (call on form submit) */
  saveOnSubmit: (formData: Record<string, any>) => Promise<void>;
  /** Get the source badge text for a field */
  getSourceBadge: (fieldName: string) => string | null;
  /** Check if a field was pre-filled */
  isPreFilled: (fieldName: string) => boolean;
}

const SOURCE_BADGES: Record<string, string> = {
  history: 'From last time',
  onboarding: 'From profile',
  chat: 'Suggested',
  default: '',
};

export function useContextualUI(
  uiType: string,
  options: UseContextualUIOptions = {}
): UseContextualUIReturn {
  const {
    organizationId,
    projectId,
    autoLoad = true,
    onContextLoaded,
    onSaveComplete,
  } = options;

  const [contextData, setContextData] = useState<MergedContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Load context
  const loadContext = useCallback(async () => {
    if (!uiType) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getMergedContext(uiType, organizationId, projectId);
      setContextData(data);
      onContextLoaded?.(data.context);
    } catch (err) {
      console.error('Failed to load context:', err);
      setError(err instanceof Error ? err : new Error('Failed to load context'));
    } finally {
      setLoading(false);
    }
  }, [uiType, organizationId, projectId, onContextLoaded]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadContext();
    }
  }, [autoLoad, loadContext]);

  // Extract context and values
  const context = useMemo(() => contextData?.context || {}, [contextData]);

  const values = useMemo(() => {
    const result: Record<string, any> = {};
    for (const [field, data] of Object.entries(context)) {
      result[field] = data.value;
    }
    return result;
  }, [context]);

  // Filter out applied suggestions
  const suggestions = useMemo(() => {
    if (!contextData?.suggestions) return [];
    return contextData.suggestions.filter(s => !appliedSuggestions.has(s.entityId));
  }, [contextData?.suggestions, appliedSuggestions]);

  // Apply a chat suggestion
  const applySuggestion = useCallback(async (suggestion: ChatSuggestion) => {
    try {
      await validateChatContext(suggestion.entityId, true);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.entityId]));

      // Add to context
      setContextData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          context: {
            ...prev.context,
            [suggestion.field]: {
              field: suggestion.field,
              value: suggestion.suggestedValue,
              source: 'chat',
              confidence: suggestion.confidence,
              showBadge: true,
              allowOverride: true,
            },
          },
        };
      });
    } catch (err) {
      console.error('Failed to apply suggestion:', err);
    }
  }, []);

  // Dismiss a chat suggestion
  const dismissSuggestion = useCallback(async (suggestion: ChatSuggestion) => {
    try {
      await validateChatContext(suggestion.entityId, false);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.entityId]));
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err);
    }
  }, []);

  // Save form data on submit
  const saveOnSubmit = useCallback(async (formData: Record<string, any>) => {
    try {
      await saveUIHistory({
        ui_type: uiType,
        ui_inputs: formData,
        organization_id: organizationId,
      });
      onSaveComplete?.();
    } catch (err) {
      console.error('Failed to save UI history:', err);
      // Don't throw - saving history shouldn't block form submission
    }
  }, [uiType, organizationId, onSaveComplete]);

  // Get source badge for a field
  const getSourceBadge = useCallback((fieldName: string): string | null => {
    const field = context[fieldName];
    if (!field || !field.showBadge) return null;
    return SOURCE_BADGES[field.source] || null;
  }, [context]);

  // Check if a field was pre-filled
  const isPreFilled = useCallback((fieldName: string): boolean => {
    return fieldName in context;
  }, [context]);

  return {
    context,
    values,
    suggestions,
    loading,
    error,
    usageCount: contextData?.usageCount || 0,
    lastUsedAt: contextData?.lastUsedAt,
    refreshContext: loadContext,
    applySuggestion,
    dismissSuggestion,
    saveOnSubmit,
    getSourceBadge,
    isPreFilled,
  };
}

// ============================================
// HELPER COMPONENTS
// ============================================

export interface ContextBadgeProps {
  source: string;
  className?: string;
}

/**
 * Badge component to show context source
 * Usage: <ContextBadge source={getSourceBadge('weight')} />
 */
export function getContextBadgeColor(source: string): string {
  switch (source) {
    case 'history':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'onboarding':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'chat':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// Default export
export default useContextualUI;
