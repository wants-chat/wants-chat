/**
 * Conversations API Service
 * Handles REST API calls for chat conversations
 */

import { api } from '@/lib/api';

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  model: string;
  is_archived: boolean;
  is_pinned: boolean;
  metadata?: Record<string, any>;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ConversationsQueryParams {
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface MessagesQueryParams {
  limit?: number;
  offset?: number;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(
  params: ConversationsQueryParams = {}
): Promise<Conversation[]> {
  const queryParams = new URLSearchParams();
  if (params.archived !== undefined) queryParams.set('archived', String(params.archived));
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit));
  if (params.offset !== undefined) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  const endpoint = `/chat/conversations${queryString ? `?${queryString}` : ''}`;

  const data = await api.get(endpoint);

  // Debug: Log raw API response
  console.log('📡 [API] Raw conversations response (first 3):',
    data?.slice(0, 3).map((c: any) => ({
      id: c.id?.slice(0, 8),
      title: c.title,
      is_pinned: c.is_pinned,
      _raw_is_pinned_type: typeof c.is_pinned,
    }))
  );

  return data;
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation> {
  return api.get(`/chat/conversations/${id}`);
}

/**
 * Create a new conversation
 */
export async function createConversation(data: {
  title?: string;
  model?: string;
}): Promise<Conversation> {
  return api.post('/chat/conversations', data);
}

/**
 * Update a conversation
 */
export async function updateConversation(
  id: string,
  data: Partial<Pick<Conversation, 'title' | 'is_archived' | 'is_pinned' | 'model'>>
): Promise<Conversation> {
  return api.put(`/chat/conversations/${id}`, data);
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  return api.delete(`/chat/conversations/${id}`);
}

/**
 * Backfill missing titles for conversations
 */
export async function backfillConversationTitles(): Promise<{ processed: number; success: number; failed: number }> {
  return api.post('/chat/backfill-titles', {});
}

/**
 * Get messages in a conversation
 */
export async function getMessages(
  conversationId: string,
  params: MessagesQueryParams = {}
): Promise<ConversationMessage[]> {
  const queryParams = new URLSearchParams();
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit));
  if (params.offset !== undefined) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  const endpoint = `/chat/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;

  return api.get(endpoint);
}

/**
 * Search conversations by title
 */
export function searchConversations(
  conversations: Conversation[],
  query: string
): Conversation[] {
  if (!query.trim()) return conversations;

  const lowerQuery = query.toLowerCase();
  return conversations.filter(conv =>
    conv.title?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Format relative time for conversation timestamps
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get the best available date for a conversation
 */
export function getConversationDate(conv: Conversation): string {
  return conv.last_message_at || conv.updated_at || conv.created_at || '';
}
