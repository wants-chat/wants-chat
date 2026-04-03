import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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

export interface CreateBranchResult {
  branchId: string;
  newMessageId: string;
}

@Injectable()
export class BranchingService {
  private readonly logger = new Logger(BranchingService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Edit a user message - creates a new version and archives subsequent messages
   * This is similar to ChatGPT's edit functionality
   */
  async editMessage(
    userId: string,
    messageId: string,
    newContent: string,
  ): Promise<EditMessageResult> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Get the original message
      const messageResult = await client.query(
        `SELECT m.*, c.id as conversation_id
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE m.id = $1 AND c.user_id = $2`,
        [messageId, userId],
      );

      if (messageResult.rows.length === 0) {
        throw new NotFoundException('Message not found');
      }

      const originalMessage = messageResult.rows[0];

      if (originalMessage.role !== 'user') {
        throw new Error('Only user messages can be edited');
      }

      // Create a branch for this edit
      const branchResult = await client.query(
        `INSERT INTO message_branches (
          conversation_id, user_id, parent_message_id, branch_type, is_active
        ) VALUES ($1, $2, $3, 'edit', TRUE)
        RETURNING id`,
        [originalMessage.conversation_id, userId, messageId],
      );

      const branchId = branchResult.rows[0].id;

      // Get the current max version for this message lineage
      const versionResult = await client.query(
        `SELECT COALESCE(MAX(version), 0) as max_version
         FROM messages
         WHERE (id = $1 OR parent_message_id = $1)`,
        [messageId],
      );

      const newVersion = parseInt(versionResult.rows[0].max_version) + 1;

      // Mark the original message as not current
      await client.query(
        `UPDATE messages SET is_current_version = FALSE WHERE id = $1`,
        [messageId],
      );

      // Create the new message version
      const newMessageResult = await client.query(
        `INSERT INTO messages (
          conversation_id, user_id, role, content, branch_id, parent_message_id,
          version, is_current_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING id`,
        [
          originalMessage.conversation_id,
          userId,
          'user',
          newContent,
          branchId,
          messageId,
          newVersion,
        ],
      );

      const newMessageId = newMessageResult.rows[0].id;

      // Archive all messages that came after the original message
      // (they belong to the old conversation thread)
      const archiveResult = await client.query(
        `UPDATE messages
         SET is_current_version = FALSE, branch_id = $1
         WHERE conversation_id = $2
           AND created_at > (SELECT created_at FROM messages WHERE id = $3)
           AND is_current_version = TRUE
         RETURNING id`,
        [branchId, originalMessage.conversation_id, messageId],
      );

      const archivedMessageIds = archiveResult.rows.map((r) => r.id);

      // Update conversation to indicate it has branches
      await client.query(
        `UPDATE conversations SET has_branches = TRUE WHERE id = $1`,
        [originalMessage.conversation_id],
      );

      await client.query('COMMIT');

      this.logger.log(
        `Edited message ${messageId}, created new version ${newMessageId}, archived ${archivedMessageIds.length} messages`,
      );

      return {
        newMessageId,
        branchId,
        archivedMessageIds,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to edit message: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create an explicit branch from a message
   * This allows users to explore alternative conversation paths
   */
  async createBranch(
    userId: string,
    parentMessageId: string,
    label?: string,
  ): Promise<CreateBranchResult> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Get the parent message
      const messageResult = await client.query(
        `SELECT m.*, c.id as conversation_id
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE m.id = $1 AND c.user_id = $2`,
        [parentMessageId, userId],
      );

      if (messageResult.rows.length === 0) {
        throw new NotFoundException('Message not found');
      }

      const parentMessage = messageResult.rows[0];

      // Get the next branch index for this parent
      const indexResult = await client.query(
        `SELECT COALESCE(MAX(branch_index), 0) + 1 as next_index
         FROM message_branches
         WHERE parent_message_id = $1`,
        [parentMessageId],
      );

      const branchIndex = parseInt(indexResult.rows[0].next_index);

      // Create the branch
      const branchResult = await client.query(
        `INSERT INTO message_branches (
          conversation_id, user_id, parent_message_id, branch_type,
          branch_label, branch_index, is_active
        ) VALUES ($1, $2, $3, 'explicit', $4, $5, TRUE)
        RETURNING id`,
        [
          parentMessage.conversation_id,
          userId,
          parentMessageId,
          label || `Branch ${branchIndex}`,
          branchIndex,
        ],
      );

      const branchId = branchResult.rows[0].id;

      // Create a placeholder message for the new branch
      // (The actual content will be added by the user)
      const placeholderResult = await client.query(
        `INSERT INTO messages (
          conversation_id, user_id, role, content, branch_id, parent_message_id,
          version, is_current_version
        ) VALUES ($1, $2, 'system', '[Branch created]', $3, $4, 1, TRUE)
        RETURNING id`,
        [parentMessage.conversation_id, userId, branchId, parentMessageId],
      );

      // Update conversation to indicate it has branches
      await client.query(
        `UPDATE conversations SET has_branches = TRUE WHERE id = $1`,
        [parentMessage.conversation_id],
      );

      await client.query('COMMIT');

      this.logger.log(
        `Created branch ${branchId} from message ${parentMessageId}`,
      );

      return {
        branchId,
        newMessageId: placeholderResult.rows[0].id,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to create branch: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Switch to a different branch
   * Deactivates current branch and activates the target branch
   */
  async switchBranch(
    userId: string,
    branchId: string,
  ): Promise<{ success: boolean; activatedBranchId: string }> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Verify the branch belongs to the user
      const branchResult = await client.query(
        `SELECT mb.*, c.id as conversation_id
         FROM message_branches mb
         JOIN conversations c ON mb.conversation_id = c.id
         WHERE mb.id = $1 AND mb.user_id = $2`,
        [branchId, userId],
      );

      if (branchResult.rows.length === 0) {
        throw new NotFoundException('Branch not found');
      }

      const branch = branchResult.rows[0];

      // Deactivate all branches for this conversation
      await client.query(
        `UPDATE message_branches
         SET is_active = FALSE
         WHERE conversation_id = $1`,
        [branch.conversation_id],
      );

      // Activate the target branch
      await client.query(
        `UPDATE message_branches SET is_active = TRUE WHERE id = $1`,
        [branchId],
      );

      // Update message visibility based on branch
      // First, hide all branched messages
      await client.query(
        `UPDATE messages
         SET is_current_version = FALSE
         WHERE conversation_id = $1
           AND branch_id IS NOT NULL`,
        [branch.conversation_id],
      );

      // Then show messages from the active branch
      await client.query(
        `UPDATE messages
         SET is_current_version = TRUE
         WHERE branch_id = $1`,
        [branchId],
      );

      await client.query('COMMIT');

      this.logger.log(`Switched to branch ${branchId}`);

      return {
        success: true,
        activatedBranchId: branchId,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to switch branch: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all versions of a specific message
   */
  async getMessageVersions(
    userId: string,
    messageId: string,
  ): Promise<MessageVersion[]> {
    // Get the root message (the original one)
    const rootResult = await this.db.query(
      `SELECT m.id, m.parent_message_id
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.id = $1 AND c.user_id = $2`,
      [messageId, userId],
    );

    if (rootResult.rows.length === 0) {
      throw new NotFoundException('Message not found');
    }

    // Find the root message ID (follow parent chain)
    let rootId = messageId;
    let parentId = rootResult.rows[0].parent_message_id;

    while (parentId) {
      const parentResult = await this.db.query(
        `SELECT parent_message_id FROM messages WHERE id = $1`,
        [parentId],
      );

      if (parentResult.rows.length === 0) break;

      rootId = parentId;
      parentId = parentResult.rows[0].parent_message_id;
    }

    // Get all versions (original + edits)
    const versionsResult = await this.db.query(
      `SELECT id, content, version, is_current_version, created_at
       FROM messages
       WHERE id = $1 OR parent_message_id = $1
       ORDER BY version ASC`,
      [rootId],
    );

    return versionsResult.rows.map((row) => ({
      id: row.id,
      content: row.content,
      version: row.version,
      isCurrentVersion: row.is_current_version,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get all branches for a conversation
   */
  async getConversationBranches(
    userId: string,
    conversationId: string,
  ): Promise<Branch[]> {
    const result = await this.db.query(
      `SELECT mb.*
       FROM message_branches mb
       JOIN conversations c ON mb.conversation_id = c.id
       WHERE mb.conversation_id = $1 AND c.user_id = $2
       ORDER BY mb.created_at ASC`,
      [conversationId, userId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      parentMessageId: row.parent_message_id,
      branchType: row.branch_type,
      branchLabel: row.branch_label,
      branchIndex: row.branch_index,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get branches from a specific message point
   */
  async getBranchesFromMessage(
    userId: string,
    messageId: string,
  ): Promise<Branch[]> {
    const result = await this.db.query(
      `SELECT mb.*
       FROM message_branches mb
       JOIN conversations c ON mb.conversation_id = c.id
       WHERE mb.parent_message_id = $1 AND mb.user_id = $2
       ORDER BY mb.branch_index ASC`,
      [messageId, userId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      parentMessageId: row.parent_message_id,
      branchType: row.branch_type,
      branchLabel: row.branch_label,
      branchIndex: row.branch_index,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  /**
   * Delete a branch and its messages
   */
  async deleteBranch(
    userId: string,
    branchId: string,
  ): Promise<{ success: boolean; deletedMessageCount: number }> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Verify ownership
      const branchResult = await client.query(
        `SELECT * FROM message_branches WHERE id = $1 AND user_id = $2`,
        [branchId, userId],
      );

      if (branchResult.rows.length === 0) {
        throw new NotFoundException('Branch not found');
      }

      // Delete messages in this branch
      const deleteResult = await client.query(
        `DELETE FROM messages WHERE branch_id = $1 RETURNING id`,
        [branchId],
      );

      // Delete the branch
      await client.query(`DELETE FROM message_branches WHERE id = $1`, [
        branchId,
      ]);

      // Check if conversation still has branches
      const remainingBranches = await client.query(
        `SELECT COUNT(*) as count FROM message_branches WHERE conversation_id = $1`,
        [branchResult.rows[0].conversation_id],
      );

      if (parseInt(remainingBranches.rows[0].count) === 0) {
        await client.query(
          `UPDATE conversations SET has_branches = FALSE WHERE id = $1`,
          [branchResult.rows[0].conversation_id],
        );
      }

      await client.query('COMMIT');

      return {
        success: true,
        deletedMessageCount: deleteResult.rowCount || 0,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to delete branch: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Rename a branch
   */
  async renameBranch(
    userId: string,
    branchId: string,
    newLabel: string,
  ): Promise<{ success: boolean }> {
    const result = await this.db.query(
      `UPDATE message_branches
       SET branch_label = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id`,
      [newLabel, branchId, userId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Branch not found');
    }

    return { success: true };
  }
}
