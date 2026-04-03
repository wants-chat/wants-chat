/**
 * Notes API Client
 * Handles notes CRUD operations
 */

import { api } from '@/lib/api';

export interface Note {
  id: string;
  localId?: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
}

export interface NotesStatistics {
  totalNotes: number;
  pinnedNotes: number;
  tagCounts: Record<string, number>;
}

export interface NotesQueryParams {
  search?: string;
  pinnedOnly?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export const notesApi = {
  /**
   * Get all notes for the user
   */
  async getNotes(params?: NotesQueryParams): Promise<NotesListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.pinnedOnly) queryParams.append('pinnedOnly', 'true');
    if (params?.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const response = await api.get(`/notes${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  /**
   * Get a single note by ID
   */
  async getNoteById(id: string): Promise<Note> {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  /**
   * Create a new note
   */
  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await api.post('/notes', data);
    return response.data;
  },

  /**
   * Update an existing note
   */
  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a note (soft delete)
   */
  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  /**
   * Toggle pin status of a note
   */
  async togglePin(id: string): Promise<Note> {
    const response = await api.put(`/notes/${id}/toggle-pin`, {});
    return response.data;
  },

  /**
   * Get notes statistics
   */
  async getStatistics(): Promise<NotesStatistics> {
    const response = await api.get('/notes/statistics');
    return response.data;
  },
};
