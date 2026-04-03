import { Blueprint } from './blueprint.interface';

/**
 * Social Network Blueprint
 *
 * Defines the structure for a social network application:
 * - User profiles
 * - Posts and feeds
 * - Followers/following
 * - Likes and comments
 * - Direct messaging
 */
export const socialBlueprint: Blueprint = {
  appType: 'social',
  description: 'Social network with posts, followers, likes, and messaging',

  coreEntities: ['profile', 'post', 'comment', 'like', 'follow', 'message'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home Feed
    {
      path: '/',
      name: 'Feed',
      layout: 'two-column',
      requiresAuth: true,
      sections: [
        {
          id: 'create-post',
          component: 'create-post',
          entity: 'post',
          position: 'main',
        },
        {
          id: 'feed',
          component: 'post-feed',
          entity: 'post',
          position: 'main',
          props: {
            type: 'following',
          },
        },
        {
          id: 'suggestions',
          component: 'user-suggestions',
          entity: 'profile',
          position: 'sidebar',
          props: {
            title: 'Who to follow',
          },
        },
        {
          id: 'trending',
          component: 'trending-topics',
          position: 'sidebar',
          props: {
            title: 'Trending',
          },
        },
      ],
    },
    // Explore
    {
      path: '/explore',
      name: 'Explore',
      layout: 'two-column',
      sections: [
        {
          id: 'search',
          component: 'search-bar',
          position: 'main',
        },
        {
          id: 'explore-feed',
          component: 'post-feed',
          entity: 'post',
          position: 'main',
          props: {
            type: 'trending',
          },
        },
        {
          id: 'trending',
          component: 'trending-topics',
          position: 'sidebar',
        },
      ],
    },
    // Profile
    {
      path: '/profile/:username',
      name: 'Profile',
      layout: 'single-column',
      sections: [
        {
          id: 'profile-header',
          component: 'profile-header',
          entity: 'profile',
          position: 'main',
        },
        {
          id: 'profile-tabs',
          component: 'profile-tabs',
          entity: 'post',
          position: 'main',
          props: {
            tabs: ['posts', 'replies', 'likes', 'media'],
          },
        },
      ],
    },
    // Post Detail
    {
      path: '/post/:id',
      name: 'Post',
      layout: 'two-column',
      sections: [
        {
          id: 'post-detail',
          component: 'post-detail',
          entity: 'post',
          position: 'main',
        },
        {
          id: 'comments',
          component: 'comment-section',
          entity: 'comment',
          position: 'main',
        },
        {
          id: 'suggestions',
          component: 'user-suggestions',
          entity: 'profile',
          position: 'sidebar',
        },
      ],
    },
    // Messages
    {
      path: '/messages',
      name: 'Messages',
      layout: 'two-column',
      requiresAuth: true,
      sections: [
        {
          id: 'conversations',
          component: 'conversation-list',
          entity: 'message',
          position: 'sidebar',
        },
        {
          id: 'chat',
          component: 'chat-window',
          entity: 'message',
          position: 'main',
        },
      ],
    },
    // Notifications
    {
      path: '/notifications',
      name: 'Notifications',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'notifications',
          component: 'notification-list',
          position: 'main',
          props: {
            title: 'Notifications',
          },
        },
      ],
    },
    // Settings
    {
      path: '/settings',
      name: 'Settings',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'settings',
          component: 'settings-form',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Feed
    { method: 'GET', path: '/feed', entity: 'post', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/explore', entity: 'post', operation: 'list' },

    // Posts
    { method: 'GET', path: '/posts', entity: 'post', operation: 'list' },
    { method: 'GET', path: '/posts/:id', entity: 'post', operation: 'get' },
    { method: 'POST', path: '/posts', entity: 'post', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/posts/:id', entity: 'post', operation: 'delete', requiresAuth: true },

    // Comments
    { method: 'GET', path: '/posts/:id/comments', entity: 'comment', operation: 'list' },
    { method: 'POST', path: '/posts/:id/comments', entity: 'comment', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/comments/:id', entity: 'comment', operation: 'delete', requiresAuth: true },

    // Likes
    { method: 'POST', path: '/posts/:id/like', entity: 'like', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/posts/:id/like', entity: 'like', operation: 'delete', requiresAuth: true },

    // Profiles
    { method: 'GET', path: '/profiles/:username', entity: 'profile', operation: 'get' },
    { method: 'PUT', path: '/profiles/:username', entity: 'profile', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/profiles/:username/posts', entity: 'post', operation: 'list' },

    // Follow
    { method: 'POST', path: '/profiles/:username/follow', entity: 'follow', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/profiles/:username/follow', entity: 'follow', operation: 'delete', requiresAuth: true },
    { method: 'GET', path: '/profiles/:username/followers', entity: 'follow', operation: 'list' },
    { method: 'GET', path: '/profiles/:username/following', entity: 'follow', operation: 'list' },

    // Messages
    { method: 'GET', path: '/messages', entity: 'message', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/messages/:conversationId', entity: 'message', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/messages', entity: 'message', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    profile: {
      defaultFields: [
        { name: 'username', type: 'string', required: true },
        { name: 'display_name', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'cover_url', type: 'image' },
        { name: 'website', type: 'url' },
        { name: 'location', type: 'string' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'is_private', type: 'boolean' },
        { name: 'follower_count', type: 'integer' },
        { name: 'following_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'post' },
        { type: 'hasMany', target: 'follow' },
      ],
    },
    post: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'media', type: 'json' },
        { name: 'like_count', type: 'integer' },
        { name: 'comment_count', type: 'integer' },
        { name: 'repost_count', type: 'integer' },
        { name: 'is_pinned', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'profile' },
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'comment' },
        { type: 'hasMany', target: 'like' },
      ],
    },
    comment: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'like_count', type: 'integer' },
        { name: 'parent_id', type: 'string' }, // Self-reference for replies (nullable FK handled at app level)
      ],
      relationships: [
        { type: 'belongsTo', target: 'post' },
        { type: 'belongsTo', target: 'user' },
        // Note: parent_id is a self-reference field, not a relationship, to avoid circular dependency
      ],
    },
    like: {
      defaultFields: [
        { name: 'liked_at', type: 'datetime', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'post' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    follow: {
      defaultFields: [
        { name: 'followed_at', type: 'datetime', required: true },
        { name: 'follower_id', type: 'string', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
      ],
    },
    message: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'media', type: 'json' },
        { name: 'is_read', type: 'boolean' },
        { name: 'conversation_id', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default socialBlueprint;
