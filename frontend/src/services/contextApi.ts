/**
 * Context API Service
 * Handles all context-related API calls for the contextual UI system
 */

import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export type ContextSource = 'default' | 'onboarding' | 'history' | 'chat';

export interface ContextField {
  field: string;
  value: any;
  source: ContextSource;
  confidence: number;
  showBadge: boolean;
  allowOverride: boolean;
}

export interface ChatSuggestion {
  field: string;
  suggestedValue: any;
  confidence: number;
  sourceDescription: string;
  extractedFrom?: string;
  entityId: string;
}

export interface MergedContext {
  context: Record<string, ContextField>;
  suggestions: ChatSuggestion[];
  uiType: string;
  lastUsedAt?: string;
  usageCount: number;
}

export interface UIHistoryRecord {
  id: string;
  user_id: string;
  organization_id?: string;
  ui_type: string;
  ui_category?: string;
  ui_inputs: Record<string, any>;
  usage_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface SaveUIHistoryDto {
  ui_type: string;
  ui_category?: string;
  ui_inputs: Record<string, any>;
  organization_id?: string;
}

export interface ContextStats {
  historyCount: number;
  chatEntitiesCount: number;
  onboardingComplete: boolean;
  mostUsedUIs: { ui_type: string; usage_count: number }[];
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get merged context for a specific UI type
 * This is the main function for pre-filling forms
 */
export async function getMergedContext(
  uiType: string,
  organizationId?: string,
  projectId?: string
): Promise<MergedContext> {
  const params = new URLSearchParams({ ui_type: uiType });
  if (organizationId) params.append('organization_id', organizationId);
  if (projectId) params.append('project_id', projectId);

  const response = await api.get(`/context/merged?${params.toString()}`);
  return response.data;
}

/**
 * Save UI history after form submission
 */
export async function saveUIHistory(dto: SaveUIHistoryDto): Promise<UIHistoryRecord> {
  const response = await api.post('/context/ui-history', dto);
  return response.data;
}

/**
 * Get UI history for a specific UI type
 */
export async function getUIHistory(
  uiType: string,
  organizationId?: string
): Promise<UIHistoryRecord | null> {
  const params = new URLSearchParams({ ui_type: uiType });
  if (organizationId) params.append('organization_id', organizationId);

  const response = await api.get(`/context/ui-history?${params.toString()}`);
  return response.data;
}

/**
 * Get all UI histories for a user
 */
export async function getUserUIHistories(
  organizationId?: string,
  limit?: number
): Promise<UIHistoryRecord[]> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organization_id', organizationId);
  if (limit) params.append('limit', limit.toString());

  const response = await api.get(`/context/ui-histories?${params.toString()}`);
  return response.data;
}

/**
 * Clear UI history
 */
export async function clearUIHistory(
  uiType?: string,
  organizationId?: string
): Promise<{ deletedCount: number }> {
  const params = new URLSearchParams();
  if (uiType) params.append('ui_type', uiType);
  if (organizationId) params.append('organization_id', organizationId);

  const response = await api.delete(`/context/ui-history?${params.toString()}`);
  return response.data;
}

/**
 * Validate a chat context suggestion (accept or reject)
 */
export async function validateChatContext(
  entityId: string,
  isValid: boolean
): Promise<void> {
  await api.post('/context/chat-context/validate', {
    entity_id: entityId,
    is_valid: isValid,
  });
}

/**
 * Get context stats for the user
 */
export async function getContextStats(): Promise<ContextStats> {
  const response = await api.get('/context/stats');
  return response.data;
}

/**
 * Clear chat context entities
 */
export async function clearChatContext(
  entityTypes?: string[],
  projectId?: string
): Promise<{ clearedCount: number }> {
  const params = new URLSearchParams();
  if (entityTypes?.length) params.append('entity_types', entityTypes.join(','));
  if (projectId) params.append('project_id', projectId);

  const response = await api.delete(`/context/chat-context?${params.toString()}`);
  return response.data;
}
