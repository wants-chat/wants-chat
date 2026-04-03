/**
 * Branching Service
 * Handles message versioning and conversation branching like ChatGPT
 */

import { api } from '../lib/api';

export interface MessageVersion {
  id: string;
  content: string;
  version: number;
  isCurrentVersion: boolean;
  createdAt: Date;
}

export interface Branch {
  id: string;
  conversationId: string;
  parentMessageId: string;
  branchType: 'edit' | 'explicit';
  branchLabel: string | null;
  branchIndex: number;
  isActive: boolean;
  createdAt: Date;
}

export interface EditMessageResult {
  newMessageId: string;
  branchId: string;
  archivedMessageIds: string[];
}

class BranchingService {
  /**
   * Edit a message (creates a new version)
   */
  async editMessage(messageId: string, newContent: string): Promise<EditMessageResult> {
    // api returns { data, message } - backend wraps response
    const response = await api.post(`/branching/messages/${messageId}/edit`, {
      newContent,
    });
    return response.data;
  }

  /**
   * Get all versions of a message
   */
  async getMessageVersions(messageId: string): Promise<MessageVersion[]> {
    // api returns { data } - backend wraps response
    const response = await api.get(`/branching/messages/${messageId}/versions`);
    return response.data || [];
  }

  /**
   * Get all branches for a conversation
   */
  async getConversationBranches(conversationId: string): Promise<Branch[]> {
    const response = await api.get(`/branching/conversations/${conversationId}/branches`);
    return response.data || [];
  }

  /**
   * Get branches from a specific message
   */
  async getBranchesFromMessage(messageId: string): Promise<Branch[]> {
    const response = await api.get(`/branching/messages/${messageId}/branches`);
    return response.data || [];
  }

  /**
   * Switch to a different branch
   */
  async switchBranch(branchId: string): Promise<{ success: boolean; activatedBranchId: string }> {
    const response = await api.put(`/branching/branches/${branchId}/activate`);
    return response.data;
  }

  /**
   * Create an explicit branch from a message
   */
  async createBranch(messageId: string, label?: string): Promise<{ branchId: string; newMessageId: string }> {
    // Only include label in body if it's defined (avoid sending undefined properties)
    const body = label ? { label } : {};
    const response = await api.post(`/branching/messages/${messageId}/branch`, body);
    return response.data;
  }

  /**
   * Rename a branch
   */
  async renameBranch(branchId: string, newLabel: string): Promise<{ success: boolean }> {
    const response = await api.put(`/branching/branches/${branchId}`, {
      newLabel,
    });
    return response.data;
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchId: string): Promise<{ success: boolean; deletedMessageCount: number }> {
    const response = await api.delete(`/branching/branches/${branchId}`);
    return response.data;
  }
}

export const branchingService = new BranchingService();
