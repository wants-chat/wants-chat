/**
 * Chat Feature Definition
 *
 * Real-time chat with rooms, channels, and group messaging.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CHAT_FEATURE: FeatureDefinition = {
  id: 'chat',
  name: 'Chat',
  category: 'communication',
  description: 'Real-time chat with rooms, channels, and group messaging',
  icon: 'message-square',

  includedInAppTypes: [
    'team-collaboration',
    'community',
    'gaming',
    'discord-clone',
    'slack-clone',
    'customer-support',
    'live-events',
    'streaming',
    'education',
    'coworking',
  ],

  activationKeywords: [
    'chat',
    'real-time chat',
    'chat rooms',
    'group chat',
    'live chat',
    'channels',
    'slack',
    'discord',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'chat-home',
      route: '/chat',
      section: 'frontend',
      title: 'Chat',
      authRequired: true,
      templateId: 'chat-home',
      components: [
        'channels-sidebar',
        'chat-window',
        'members-list',
        'chat-input',
      ],
      layout: 'chat',
    },
    {
      id: 'chat-room',
      route: '/chat/:roomId',
      section: 'frontend',
      title: 'Chat Room',
      authRequired: true,
      templateId: 'chat-room',
      components: [
        'room-header',
        'message-list',
        'chat-input',
        'member-presence',
      ],
      layout: 'chat',
    },
    {
      id: 'admin-chat',
      route: '/admin/chat',
      section: 'admin',
      title: 'Chat Settings',
      authRequired: true,
      templateId: 'admin-chat',
      components: [
        'rooms-manager',
        'moderation-tools',
        'chat-analytics',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Layout
    'channels-sidebar',
    'chat-window',
    'members-list',

    // Chat
    'message-list',
    'chat-message',
    'chat-input',
    'room-header',
    'member-presence',
    'typing-indicator',

    // Features
    'emoji-picker',
    'gif-picker',
    'mention-picker',
    'thread-view',
    'reactions-bar',

    // Admin
    'rooms-manager',
    'moderation-tools',
    'chat-analytics',
    'ban-user-modal',
  ],

  entities: [
    {
      name: 'chat_rooms',
      displayName: 'Chat Rooms',
      description: 'Chat rooms/channels',
      isCore: true,
    },
    {
      name: 'chat_messages',
      displayName: 'Chat Messages',
      description: 'Chat messages',
      isCore: true,
    },
    {
      name: 'room_members',
      displayName: 'Room Members',
      description: 'Room membership',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/chat/rooms',
      auth: true,
      handler: 'crud',
      entity: 'chat_rooms',
      description: 'List rooms',
    },
    {
      method: 'POST',
      path: '/chat/rooms',
      auth: true,
      handler: 'crud',
      entity: 'chat_rooms',
      description: 'Create room',
    },
    {
      method: 'GET',
      path: '/chat/rooms/:id',
      auth: true,
      handler: 'crud',
      entity: 'chat_rooms',
      description: 'Get room',
    },
    {
      method: 'DELETE',
      path: '/chat/rooms/:id',
      auth: true,
      handler: 'crud',
      entity: 'chat_rooms',
      description: 'Delete room',
    },
    {
      method: 'GET',
      path: '/chat/rooms/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'chat_messages',
      description: 'Get messages',
    },
    {
      method: 'POST',
      path: '/chat/rooms/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'chat_messages',
      description: 'Send message',
    },
    {
      method: 'POST',
      path: '/chat/rooms/:id/join',
      auth: true,
      handler: 'custom',
      entity: 'room_members',
      description: 'Join room',
    },
    {
      method: 'POST',
      path: '/chat/rooms/:id/leave',
      auth: true,
      handler: 'custom',
      entity: 'room_members',
      description: 'Leave room',
    },
    {
      method: 'GET',
      path: '/chat/rooms/:id/members',
      auth: true,
      handler: 'crud',
      entity: 'room_members',
      description: 'Get members',
    },
  ],

  config: [
    {
      key: 'enableThreads',
      label: 'Enable Threads',
      type: 'boolean',
      default: true,
      description: 'Allow threaded replies',
    },
    {
      key: 'enableReactions',
      label: 'Enable Reactions',
      type: 'boolean',
      default: true,
      description: 'Allow emoji reactions',
    },
    {
      key: 'maxRoomMembers',
      label: 'Max Room Members',
      type: 'number',
      default: 100,
      description: 'Maximum members per room',
    },
    {
      key: 'messageRetention',
      label: 'Message Retention (days)',
      type: 'number',
      default: 365,
      description: 'Days to keep messages',
    },
  ],
};
