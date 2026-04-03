/**
 * Messaging Feature Definition
 *
 * Direct messaging with inbox, conversations,
 * and real-time message delivery.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const MESSAGING_FEATURE: FeatureDefinition = {
  id: 'messaging',
  name: 'Messaging',
  category: 'communication',
  description: 'Direct messaging with inbox, conversations, and attachments',
  icon: 'mail',

  includedInAppTypes: [
    'social-network',
    'dating',
    'marketplace',
    'freelance',
    'job-board',
    'community',
    'forum',
    'education',
    'tutoring',
    'healthcare',
    'real-estate',
    'classifieds',
    'networking',
    'mentorship',
  ],

  activationKeywords: [
    'messaging',
    'messages',
    'inbox',
    'direct message',
    'dm',
    'private messages',
    'conversations',
    'chat system',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'inbox',
      route: '/messages',
      section: 'frontend',
      title: 'Messages',
      authRequired: true,
      templateId: 'inbox',
      components: [
        'conversations-list',
        'conversation-preview',
        'unread-badge',
        'search-messages',
      ],
      layout: 'default',
    },
    {
      id: 'conversation',
      route: '/messages/:id',
      section: 'frontend',
      title: 'Conversation',
      authRequired: true,
      templateId: 'conversation',
      components: [
        'message-thread',
        'message-input',
        'attachment-button',
        'conversation-header',
      ],
      layout: 'default',
    },
    {
      id: 'new-message',
      route: '/messages/new',
      section: 'frontend',
      title: 'New Message',
      authRequired: true,
      templateId: 'new-message',
      components: [
        'recipient-picker',
        'message-composer',
        'send-button',
      ],
      layout: 'default',
    },
  ],

  components: [
    // Inbox
    'conversations-list',
    'conversation-preview',
    'unread-badge',
    'search-messages',

    // Conversation
    'message-thread',
    'message-bubble',
    'message-input',
    'attachment-button',
    'conversation-header',
    'typing-indicator',

    // Compose
    'recipient-picker',
    'message-composer',
    'send-button',
    'emoji-picker',

    // Attachments
    'attachment-preview',
    'image-attachment',
    'file-attachment',
  ],

  entities: [
    {
      name: 'conversations',
      displayName: 'Conversations',
      description: 'Message threads',
      isCore: true,
    },
    {
      name: 'messages',
      displayName: 'Messages',
      description: 'Individual messages',
      isCore: true,
    },
    {
      name: 'message_attachments',
      displayName: 'Attachments',
      description: 'Message attachments',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/conversations',
      auth: true,
      handler: 'crud',
      entity: 'conversations',
      description: 'List conversations',
    },
    {
      method: 'GET',
      path: '/conversations/:id',
      auth: true,
      handler: 'crud',
      entity: 'conversations',
      description: 'Get conversation',
    },
    {
      method: 'POST',
      path: '/conversations',
      auth: true,
      handler: 'crud',
      entity: 'conversations',
      description: 'Start conversation',
    },
    {
      method: 'DELETE',
      path: '/conversations/:id',
      auth: true,
      handler: 'crud',
      entity: 'conversations',
      description: 'Delete conversation',
    },
    {
      method: 'GET',
      path: '/conversations/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'messages',
      description: 'Get messages',
    },
    {
      method: 'POST',
      path: '/conversations/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'messages',
      description: 'Send message',
    },
    {
      method: 'POST',
      path: '/conversations/:id/read',
      auth: true,
      handler: 'custom',
      entity: 'conversations',
      description: 'Mark as read',
    },
    {
      method: 'GET',
      path: '/messages/unread',
      auth: true,
      handler: 'custom',
      entity: 'messages',
      description: 'Get unread count',
    },
  ],

  config: [
    {
      key: 'maxMessageLength',
      label: 'Max Message Length',
      type: 'number',
      default: 5000,
      description: 'Maximum characters per message',
    },
    {
      key: 'allowAttachments',
      label: 'Allow Attachments',
      type: 'boolean',
      default: true,
      description: 'Enable file attachments',
    },
    {
      key: 'maxAttachmentSize',
      label: 'Max Attachment Size (MB)',
      type: 'number',
      default: 10,
      description: 'Maximum file size',
    },
    {
      key: 'enableReadReceipts',
      label: 'Enable Read Receipts',
      type: 'boolean',
      default: true,
      description: 'Show when messages are read',
    },
  ],
};
