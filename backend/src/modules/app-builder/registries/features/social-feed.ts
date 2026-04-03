/**
 * Social Feed Feature Definition
 *
 * Complete social networking functionality including posts, feed,
 * followers, groups, reactions, and activity streams.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SOCIAL_FEED_FEATURE: FeatureDefinition = {
  id: 'social-feed',
  name: 'Social Feed',
  category: 'social',
  description: 'Social networking with posts, feed, followers, groups, and reactions',
  icon: 'rss',

  includedInAppTypes: [
    'social-network',
    'social-media',
    'community',
    'forum',
    'social-club',
    'gaming-community',
    'alumni-network',
    'professional-network',
    'dating-app',
    'social-learning',
  ],

  activationKeywords: [
    'social network',
    'social media',
    'news feed',
    'activity feed',
    'posts',
    'followers',
    'following',
    'friends',
    'groups',
    'communities',
    'likes',
    'reactions',
    'comments',
    'share',
    'timeline',
    'wall',
    'status updates',
    'social platform',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth', 'notifications'],
  conflicts: [],

  pages: [
    // ═══════════════════════════════════════════════════════════
    // MAIN FEED - The home page for logged in users
    // ═══════════════════════════════════════════════════════════
    {
      id: 'feed',
      route: '/feed',
      section: 'frontend',
      title: 'Home Feed',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'feed',
      components: [
        'post-composer',
        'social-media-feed',
        'trending-sidebar',
        'suggested-users',
        'activity-indicators',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // USER PROFILE - View user's posts and info
    // ═══════════════════════════════════════════════════════════
    {
      id: 'profile',
      route: '/profile/:username',
      section: 'frontend',
      title: 'Profile',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'profile',
      components: [
        'profile-header',
        'profile-stats',
        'follow-unfollow-button',
        'profile-tabs',
        'user-posts-grid',
        'user-media-gallery',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // MY PROFILE - Edit own profile
    // ═══════════════════════════════════════════════════════════
    {
      id: 'my-profile',
      route: '/profile',
      section: 'frontend',
      title: 'My Profile',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'profile',
      components: [
        'profile-header',
        'profile-edit-button',
        'profile-stats',
        'profile-tabs',
        'user-posts-grid',
        'user-media-gallery',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // SINGLE POST VIEW
    // ═══════════════════════════════════════════════════════════
    {
      id: 'post-detail',
      route: '/post/:id',
      section: 'frontend',
      title: 'Post',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'post-detail',
      components: [
        'social-post-card',
        'like-reaction-buttons',
        'comment-section',
        'share-buttons',
        'related-posts',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // EXPLORE / DISCOVER
    // ═══════════════════════════════════════════════════════════
    {
      id: 'explore',
      route: '/explore',
      section: 'frontend',
      title: 'Explore',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'explore',
      components: [
        'search-bar',
        'trending-topics',
        'popular-posts',
        'suggested-users-grid',
        'category-filter',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // FOLLOWERS / FOLLOWING
    // ═══════════════════════════════════════════════════════════
    {
      id: 'followers',
      route: '/profile/:username/followers',
      section: 'frontend',
      title: 'Followers',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'followers',
      components: [
        'user-list',
        'follow-unfollow-button',
        'user-search',
      ],
      layout: 'default',
    },
    {
      id: 'following',
      route: '/profile/:username/following',
      section: 'frontend',
      title: 'Following',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'following',
      components: [
        'user-list',
        'follow-unfollow-button',
        'user-search',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // GROUPS
    // ═══════════════════════════════════════════════════════════
    {
      id: 'groups',
      route: '/groups',
      section: 'frontend',
      title: 'Groups',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'groups',
      components: [
        'groups-list',
        'create-group-button',
        'my-groups',
        'suggested-groups',
        'group-search',
      ],
      layout: 'default',
    },
    {
      id: 'group-detail',
      route: '/groups/:id',
      section: 'frontend',
      title: 'Group',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'group-detail',
      components: [
        'group-header',
        'group-stats',
        'join-group-button',
        'post-composer',
        'group-feed',
        'group-members',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════
    {
      id: 'messages',
      route: '/messages',
      section: 'frontend',
      title: 'Messages',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'messages',
      components: [
        'conversations-list',
        'direct-messaging-thread',
        'new-message-button',
        'message-search',
      ],
      layout: 'default',
    },
    {
      id: 'message-thread',
      route: '/messages/:conversationId',
      section: 'frontend',
      title: 'Conversation',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'message-thread',
      components: [
        'conversation-header',
        'direct-messaging-thread',
        'message-input',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    {
      id: 'notifications',
      route: '/notifications',
      section: 'frontend',
      title: 'Notifications',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'notifications',
      components: [
        'notification-list',
        'notification-filters',
        'mark-all-read-button',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════
    {
      id: 'search',
      route: '/search',
      section: 'frontend',
      title: 'Search',
      authRequired: false,
      roles: ['guest', 'member', 'verified', 'moderator', 'admin'],
      templateId: 'search',
      components: [
        'search-bar',
        'search-tabs',
        'search-results-posts',
        'search-results-users',
        'search-results-groups',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════════════════════
    {
      id: 'settings',
      route: '/settings',
      section: 'frontend',
      title: 'Settings',
      authRequired: true,
      roles: ['member', 'verified', 'moderator', 'admin'],
      templateId: 'settings',
      components: [
        'settings-sidebar',
        'profile-settings',
        'privacy-settings',
        'notification-settings',
        'account-settings',
      ],
      layout: 'default',
    },
    // ═══════════════════════════════════════════════════════════
    // ADMIN - Content Moderation
    // ═══════════════════════════════════════════════════════════
    {
      id: 'admin-posts',
      route: '/admin/posts',
      section: 'admin',
      title: 'Manage Posts',
      authRequired: true,
      roles: ['moderator', 'admin'],
      templateId: 'admin-posts',
      components: [
        'posts-table',
        'post-moderation-actions',
        'content-filters',
        'bulk-actions',
      ],
      layout: 'admin',
    },
    {
      id: 'admin-users',
      route: '/admin/users',
      section: 'admin',
      title: 'Manage Users',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-users',
      components: [
        'users-table',
        'user-moderation-actions',
        'user-filters',
        'bulk-actions',
      ],
      layout: 'admin',
    },
    {
      id: 'admin-reports',
      route: '/admin/reports',
      section: 'admin',
      title: 'Reports',
      authRequired: true,
      roles: ['moderator', 'admin'],
      templateId: 'admin-reports',
      components: [
        'reports-table',
        'report-detail',
        'moderation-actions',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Feed components
    'post-composer',
    'social-media-feed',
    'social-post-card',
    'trending-sidebar',
    'suggested-users',
    'activity-indicators',

    // Interaction components
    'like-reaction-buttons',
    'comment-section',
    'comment-form',
    'share-buttons',
    'follow-unfollow-button',

    // Profile components
    'profile-header',
    'profile-stats',
    'profile-tabs',
    'profile-edit-button',
    'user-posts-grid',
    'user-media-gallery',

    // User list components
    'user-list',
    'user-card',
    'user-search',
    'suggested-users-grid',

    // Group components
    'groups-list',
    'group-card',
    'group-header',
    'group-stats',
    'group-feed',
    'group-members',
    'join-group-button',
    'create-group-button',
    'group-search',

    // Messaging components
    'conversations-list',
    'conversation-header',
    'direct-messaging-thread',
    'message-input',
    'new-message-button',
    'message-search',

    // Notification components
    'notification-list',
    'notification-filters',
    'mark-all-read-button',

    // Search components
    'search-bar',
    'search-tabs',
    'search-results-posts',
    'search-results-users',
    'search-results-groups',

    // Explore components
    'trending-topics',
    'popular-posts',
    'category-filter',

    // Settings components
    'settings-sidebar',
    'profile-settings',
    'privacy-settings',
    'notification-settings',
    'account-settings',

    // Admin components
    'posts-table',
    'users-table',
    'reports-table',
    'post-moderation-actions',
    'user-moderation-actions',
    'content-filters',
    'user-filters',
    'bulk-actions',
    'report-detail',
    'moderation-actions',
  ],

  entities: [
    {
      name: 'posts',
      displayName: 'Posts',
      description: 'User posts and status updates',
      isCore: true,
    },
    {
      name: 'comments',
      displayName: 'Comments',
      description: 'Comments on posts',
      isCore: true,
    },
    {
      name: 'reactions',
      displayName: 'Reactions',
      description: 'Likes and reactions on posts',
      isCore: true,
    },
    {
      name: 'followers',
      displayName: 'Followers',
      description: 'User follow relationships',
      isCore: true,
    },
    {
      name: 'groups',
      displayName: 'Groups',
      description: 'Community groups',
      isCore: true,
    },
    {
      name: 'group_members',
      displayName: 'Group Members',
      description: 'Group membership',
      isCore: true,
    },
    {
      name: 'conversations',
      displayName: 'Conversations',
      description: 'Direct message conversations',
      isCore: true,
    },
    {
      name: 'messages',
      displayName: 'Messages',
      description: 'Direct messages between users',
      isCore: true,
    },
    {
      name: 'notifications',
      displayName: 'Notifications',
      description: 'User notifications',
      isCore: true,
    },
    {
      name: 'reports',
      displayName: 'Reports',
      description: 'Content reports for moderation',
      isCore: false,
    },
  ],

  apiRoutes: [
    // ═══════════════════════════════════════════════════════════
    // POSTS
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/feed', auth: true, role: 'member', handler: 'custom', entity: 'posts', description: 'Get personalized feed' },
    { method: 'GET', path: '/posts', auth: false, role: 'guest', handler: 'crud', entity: 'posts', description: 'List public posts' },
    { method: 'POST', path: '/posts', auth: true, role: 'member', handler: 'crud', entity: 'posts', description: 'Create a post' },
    { method: 'GET', path: '/posts/:id', auth: false, role: 'guest', handler: 'crud', entity: 'posts', description: 'Get single post' },
    { method: 'PUT', path: '/posts/:id', auth: true, role: 'member', handler: 'crud', entity: 'posts', description: 'Update own post' },
    { method: 'DELETE', path: '/posts/:id', auth: true, role: 'member', handler: 'crud', entity: 'posts', description: 'Delete own post' },
    { method: 'GET', path: '/users/:id/posts', auth: false, role: 'guest', handler: 'custom', entity: 'posts', description: 'Get user posts' },

    // ═══════════════════════════════════════════════════════════
    // REACTIONS (LIKES)
    // ═══════════════════════════════════════════════════════════
    { method: 'POST', path: '/posts/:id/react', auth: true, role: 'member', handler: 'custom', entity: 'reactions', description: 'React to a post' },
    { method: 'DELETE', path: '/posts/:id/react', auth: true, role: 'member', handler: 'custom', entity: 'reactions', description: 'Remove reaction' },
    { method: 'GET', path: '/posts/:id/reactions', auth: false, role: 'guest', handler: 'custom', entity: 'reactions', description: 'Get post reactions' },

    // ═══════════════════════════════════════════════════════════
    // COMMENTS
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/posts/:id/comments', auth: false, role: 'guest', handler: 'crud', entity: 'comments', description: 'Get post comments' },
    { method: 'POST', path: '/posts/:id/comments', auth: true, role: 'member', handler: 'crud', entity: 'comments', description: 'Add comment' },
    { method: 'PUT', path: '/comments/:id', auth: true, role: 'member', handler: 'crud', entity: 'comments', description: 'Update comment' },
    { method: 'DELETE', path: '/comments/:id', auth: true, role: 'member', handler: 'crud', entity: 'comments', description: 'Delete comment' },

    // ═══════════════════════════════════════════════════════════
    // FOLLOWERS
    // ═══════════════════════════════════════════════════════════
    { method: 'POST', path: '/users/:id/follow', auth: true, role: 'member', handler: 'custom', entity: 'followers', description: 'Follow user' },
    { method: 'DELETE', path: '/users/:id/follow', auth: true, role: 'member', handler: 'custom', entity: 'followers', description: 'Unfollow user' },
    { method: 'GET', path: '/users/:id/followers', auth: false, role: 'guest', handler: 'custom', entity: 'followers', description: 'Get followers' },
    { method: 'GET', path: '/users/:id/following', auth: false, role: 'guest', handler: 'custom', entity: 'followers', description: 'Get following' },

    // ═══════════════════════════════════════════════════════════
    // GROUPS
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/groups', auth: false, role: 'guest', handler: 'crud', entity: 'groups', description: 'List groups' },
    { method: 'POST', path: '/groups', auth: true, role: 'member', handler: 'crud', entity: 'groups', description: 'Create group' },
    { method: 'GET', path: '/groups/:id', auth: false, role: 'guest', handler: 'crud', entity: 'groups', description: 'Get group' },
    { method: 'PUT', path: '/groups/:id', auth: true, role: 'member', handler: 'crud', entity: 'groups', description: 'Update group' },
    { method: 'DELETE', path: '/groups/:id', auth: true, role: 'admin', handler: 'crud', entity: 'groups', description: 'Delete group' },
    { method: 'POST', path: '/groups/:id/join', auth: true, role: 'member', handler: 'custom', entity: 'group_members', description: 'Join group' },
    { method: 'DELETE', path: '/groups/:id/leave', auth: true, role: 'member', handler: 'custom', entity: 'group_members', description: 'Leave group' },
    { method: 'GET', path: '/groups/:id/members', auth: false, role: 'guest', handler: 'custom', entity: 'group_members', description: 'Get members' },
    { method: 'GET', path: '/groups/:id/posts', auth: false, role: 'guest', handler: 'custom', entity: 'posts', description: 'Get group posts' },

    // ═══════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/conversations', auth: true, role: 'member', handler: 'crud', entity: 'conversations', description: 'Get conversations' },
    { method: 'POST', path: '/conversations', auth: true, role: 'member', handler: 'crud', entity: 'conversations', description: 'Start conversation' },
    { method: 'GET', path: '/conversations/:id', auth: true, role: 'member', handler: 'crud', entity: 'conversations', description: 'Get conversation' },
    { method: 'GET', path: '/conversations/:id/messages', auth: true, role: 'member', handler: 'crud', entity: 'messages', description: 'Get messages' },
    { method: 'POST', path: '/conversations/:id/messages', auth: true, role: 'member', handler: 'crud', entity: 'messages', description: 'Send message' },

    // ═══════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/notifications', auth: true, role: 'member', handler: 'crud', entity: 'notifications', description: 'Get notifications' },
    { method: 'PUT', path: '/notifications/:id/read', auth: true, role: 'member', handler: 'custom', entity: 'notifications', description: 'Mark as read' },
    { method: 'PUT', path: '/notifications/read-all', auth: true, role: 'member', handler: 'custom', entity: 'notifications', description: 'Mark all read' },

    // ═══════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/search/posts', auth: false, role: 'guest', handler: 'custom', entity: 'posts', description: 'Search posts' },
    { method: 'GET', path: '/search/users', auth: false, role: 'guest', handler: 'custom', entity: 'users', description: 'Search users' },
    { method: 'GET', path: '/search/groups', auth: false, role: 'guest', handler: 'custom', entity: 'groups', description: 'Search groups' },

    // ═══════════════════════════════════════════════════════════
    // EXPLORE
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/explore/trending', auth: false, role: 'guest', handler: 'custom', entity: 'posts', description: 'Trending posts' },
    { method: 'GET', path: '/explore/suggested-users', auth: true, role: 'member', handler: 'custom', entity: 'users', description: 'Suggested users' },
    { method: 'GET', path: '/explore/suggested-groups', auth: true, role: 'member', handler: 'custom', entity: 'groups', description: 'Suggested groups' },

    // ═══════════════════════════════════════════════════════════
    // ADMIN / MODERATION
    // ═══════════════════════════════════════════════════════════
    { method: 'GET', path: '/admin/posts', auth: true, role: 'moderator', handler: 'crud', entity: 'posts', description: 'Admin list posts' },
    { method: 'DELETE', path: '/admin/posts/:id', auth: true, role: 'moderator', handler: 'crud', entity: 'posts', description: 'Admin delete post' },
    { method: 'GET', path: '/admin/users', auth: true, role: 'admin', handler: 'crud', entity: 'users', description: 'Admin list users' },
    { method: 'PUT', path: '/admin/users/:id/ban', auth: true, role: 'admin', handler: 'custom', entity: 'users', description: 'Ban user' },
    { method: 'GET', path: '/admin/reports', auth: true, role: 'moderator', handler: 'crud', entity: 'reports', description: 'Get reports' },
    { method: 'POST', path: '/reports', auth: true, role: 'member', handler: 'crud', entity: 'reports', description: 'Report content' },
    { method: 'PUT', path: '/admin/reports/:id', auth: true, role: 'moderator', handler: 'crud', entity: 'reports', description: 'Handle report' },
  ],

  config: [
    {
      key: 'allowPublicPosts',
      label: 'Allow Public Posts',
      type: 'boolean',
      default: true,
      description: 'Allow posts to be visible to non-logged-in users',
    },
    {
      key: 'maxPostLength',
      label: 'Max Post Length',
      type: 'number',
      default: 5000,
      description: 'Maximum characters per post',
    },
    {
      key: 'enableGroups',
      label: 'Enable Groups',
      type: 'boolean',
      default: true,
      description: 'Enable group/community features',
    },
    {
      key: 'enableDirectMessages',
      label: 'Enable Direct Messages',
      type: 'boolean',
      default: true,
      description: 'Enable private messaging between users',
    },
    {
      key: 'requireApprovalForGroups',
      label: 'Require Admin Approval for Groups',
      type: 'boolean',
      default: false,
      description: 'New groups require admin approval',
    },
    {
      key: 'reactionTypes',
      label: 'Reaction Types',
      type: 'select',
      default: 'likes-only',
      options: [
        { value: 'likes-only', label: 'Likes only' },
        { value: 'reactions', label: 'Multiple reactions (like, love, etc.)' },
      ],
      description: 'Type of reactions users can add to posts',
    },
  ],
};
