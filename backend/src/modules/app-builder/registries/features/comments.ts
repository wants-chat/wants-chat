/**
 * Comments Feature Definition
 *
 * Comments and discussions on any content type
 * with threading, moderation, and reactions.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const COMMENTS_FEATURE: FeatureDefinition = {
  id: 'comments',
  name: 'Comments',
  category: 'content',
  description: 'Comments with threading, moderation, and reactions',
  icon: 'message-circle',

  includedInAppTypes: [
    'blog',
    'news-site',
    'forum',
    'community',
    'social-network',
    'ecommerce',
    'video-platform',
    'podcast',
    'course-platform',
    'marketplace',
    'review-site',
  ],

  activationKeywords: [
    'comments',
    'commenting',
    'discussion',
    'replies',
    'threads',
    'feedback',
    'disqus',
    'user comments',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'admin-comments',
      route: '/admin/comments',
      section: 'admin',
      title: 'Comments',
      authRequired: true,
      templateId: 'admin-comments',
      components: [
        'comments-table',
        'moderation-queue',
        'spam-filter',
        'comment-stats',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Display
    'comments-section',
    'comment-item',
    'comment-thread',
    'replies-list',

    // Form
    'comment-form',
    'reply-form',
    'edit-comment-form',

    // Actions
    'like-button',
    'reaction-picker',
    'report-button',
    'delete-button',

    // Admin
    'comments-table',
    'moderation-queue',
    'spam-filter',
    'comment-stats',

    // User
    'avatar',
    'author-info',
    'timestamp',
  ],

  entities: [
    {
      name: 'comments',
      displayName: 'Comments',
      description: 'User comments',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'content', type: 'text', required: true },
        { name: 'user_id', type: 'string', required: true },
        { name: 'parent_id', type: 'uuid', references: { table: 'comments' } },
        { name: 'target_type', type: 'text', required: true },
        { name: 'target_id', type: 'uuid', required: true },
        { name: 'status', type: 'text', default: "'approved'" },
        { name: 'likes_count', type: 'integer', default: '0' },
        { name: 'replies_count', type: 'integer', default: '0' },
        { name: 'is_edited', type: 'boolean', default: 'false' },
        { name: 'edited_at', type: 'timestamptz' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'comment_reactions',
      displayName: 'Reactions',
      description: 'Comment reactions',
      isCore: false,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'comment_id', type: 'uuid', required: true, references: { table: 'comments' } },
        { name: 'user_id', type: 'string', required: true },
        { name: 'reaction_type', type: 'text', required: true },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'comment_reports',
      displayName: 'Reports',
      description: 'Reported comments',
      isCore: false,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'comment_id', type: 'uuid', required: true, references: { table: 'comments' } },
        { name: 'user_id', type: 'string', required: true },
        { name: 'reason', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'text', default: "'pending'" },
        { name: 'reviewed_by', type: 'string' },
        { name: 'reviewed_at', type: 'timestamptz' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/comments',
      auth: false,
      handler: 'crud',
      entity: 'comments',
      description: 'List comments',
    },
    {
      method: 'POST',
      path: '/comments',
      auth: true,
      handler: 'crud',
      entity: 'comments',
      description: 'Add comment',
    },
    {
      method: 'PUT',
      path: '/comments/:id',
      auth: true,
      handler: 'crud',
      entity: 'comments',
      description: 'Edit comment',
    },
    {
      method: 'DELETE',
      path: '/comments/:id',
      auth: true,
      handler: 'crud',
      entity: 'comments',
      description: 'Delete comment',
    },
    {
      method: 'POST',
      path: '/comments/:id/reply',
      auth: true,
      handler: 'crud',
      entity: 'comments',
      description: 'Reply to comment',
    },
    {
      method: 'POST',
      path: '/comments/:id/react',
      auth: true,
      handler: 'custom',
      entity: 'comment_reactions',
      description: 'React to comment',
    },
    {
      method: 'POST',
      path: '/comments/:id/report',
      auth: true,
      handler: 'custom',
      entity: 'comment_reports',
      description: 'Report comment',
    },
    {
      method: 'POST',
      path: '/comments/:id/approve',
      auth: true,
      handler: 'custom',
      entity: 'comments',
      description: 'Approve comment',
    },
  ],

  config: [
    {
      key: 'moderationEnabled',
      label: 'Enable Moderation',
      type: 'boolean',
      default: true,
      description: 'Require approval for comments',
    },
    {
      key: 'maxDepth',
      label: 'Max Thread Depth',
      type: 'number',
      default: 3,
      description: 'Maximum reply nesting level',
    },
    {
      key: 'allowEditing',
      label: 'Allow Editing',
      type: 'boolean',
      default: true,
      description: 'Allow users to edit comments',
    },
    {
      key: 'enableReactions',
      label: 'Enable Reactions',
      type: 'boolean',
      default: true,
      description: 'Allow reactions on comments',
    },
  ],
};
