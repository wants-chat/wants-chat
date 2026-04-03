import { Blueprint } from './blueprint.interface';

/**
 * Forum/Community Blueprint
 *
 * Defines the structure for a forum/community application:
 * - Categories/Forums
 * - Topics/Threads
 * - Posts/Replies
 * - Users/Profiles
 * - Tags
 * - Notifications
 */
export const forumBlueprint: Blueprint = {
  appType: 'forum',
  description: 'Forum/community app with discussions, topics, and user profiles',

  coreEntities: ['category', 'forum', 'topic', 'post', 'member', 'tag', 'notification', 'badge'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home/Landing
    {
      path: '/',
      name: 'Home',
      layout: 'two-column',
      sections: [
        {
          id: 'forum-sidebar',
          component: 'forum-sidebar',
          position: 'sidebar',
        },
        {
          id: 'announcements',
          component: 'announcement-list',
          entity: 'topic',
          position: 'main',
          props: {
            title: 'Announcements',
            type: 'announcement',
            limit: 3,
          },
        },
        {
          id: 'category-list',
          component: 'category-list',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Forums',
          },
        },
        {
          id: 'recent-topics',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
          props: {
            title: 'Recent Discussions',
            limit: 10,
          },
        },
      ],
    },
    // Category/Forum View
    {
      path: '/forum/:slug',
      name: 'Forum',
      layout: 'two-column',
      sections: [
        {
          id: 'forum-sidebar',
          component: 'forum-sidebar',
          position: 'sidebar',
        },
        {
          id: 'forum-header',
          component: 'forum-header',
          entity: 'forum',
          position: 'main',
        },
        {
          id: 'subforums',
          component: 'subforum-list',
          entity: 'forum',
          position: 'main',
        },
        {
          id: 'pinned-topics',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
          props: {
            pinned: true,
          },
        },
        {
          id: 'topic-list',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
        },
      ],
    },
    // Topic/Thread View
    {
      path: '/topic/:id',
      name: 'Topic',
      layout: 'two-column',
      sections: [
        {
          id: 'forum-sidebar',
          component: 'forum-sidebar',
          position: 'sidebar',
        },
        {
          id: 'topic-header',
          component: 'topic-header',
          entity: 'topic',
          position: 'main',
        },
        {
          id: 'post-list',
          component: 'post-list',
          entity: 'post',
          position: 'main',
        },
        {
          id: 'reply-form',
          component: 'reply-form',
          entity: 'post',
          position: 'main',
        },
      ],
    },
    // Create Topic
    {
      path: '/new-topic',
      name: 'New Topic',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'topic-form',
          component: 'topic-form',
          entity: 'topic',
          position: 'main',
        },
      ],
    },
    // Search
    {
      path: '/search',
      name: 'Search',
      layout: 'two-column',
      sections: [
        {
          id: 'search-sidebar',
          component: 'search-filters',
          position: 'sidebar',
        },
        {
          id: 'search-results',
          component: 'search-results',
          position: 'main',
        },
      ],
    },
    // Members
    {
      path: '/members',
      name: 'Members',
      layout: 'single-column',
      sections: [
        {
          id: 'member-search',
          component: 'member-search',
          position: 'main',
        },
        {
          id: 'member-grid',
          component: 'member-grid',
          entity: 'member',
          position: 'main',
        },
      ],
    },
    // Member Profile
    {
      path: '/member/:username',
      name: 'Profile',
      layout: 'single-column',
      sections: [
        {
          id: 'profile-header',
          component: 'profile-header',
          entity: 'member',
          position: 'main',
        },
        {
          id: 'profile-stats',
          component: 'profile-stats',
          entity: 'member',
          position: 'main',
        },
        {
          id: 'profile-badges',
          component: 'badge-list',
          entity: 'badge',
          position: 'main',
          props: {
            title: 'Badges & Achievements',
          },
        },
        {
          id: 'profile-activity',
          component: 'activity-feed',
          position: 'main',
          props: {
            title: 'Recent Activity',
          },
        },
        {
          id: 'profile-topics',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
          props: {
            title: 'Topics Started',
            limit: 5,
          },
        },
      ],
    },
    // User Dashboard
    {
      path: '/dashboard',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
              { label: 'My Topics', path: '/dashboard/topics', icon: 'MessageSquare' },
              { label: 'My Posts', path: '/dashboard/posts', icon: 'FileText' },
              { label: 'Notifications', path: '/dashboard/notifications', icon: 'Bell' },
              { label: 'Bookmarks', path: '/dashboard/bookmarks', icon: 'Bookmark' },
              { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
            ],
          },
        },
        {
          id: 'notifications',
          component: 'notification-list',
          entity: 'notification',
          position: 'main',
          props: {
            title: 'Recent Notifications',
            limit: 5,
          },
        },
        {
          id: 'subscribed-topics',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
          props: {
            title: 'Subscribed Topics',
            subscribed: true,
            limit: 5,
          },
        },
      ],
    },
    // My Topics
    {
      path: '/dashboard/topics',
      name: 'My Topics',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'my-topics',
          component: 'topic-list',
          entity: 'topic',
          position: 'main',
          props: {
            title: 'My Topics',
            mine: true,
          },
        },
      ],
    },
    // Notifications
    {
      path: '/dashboard/notifications',
      name: 'Notifications',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'all-notifications',
          component: 'notification-list',
          entity: 'notification',
          position: 'main',
          props: {
            title: 'All Notifications',
          },
        },
      ],
    },
    // Settings
    {
      path: '/dashboard/settings',
      name: 'Settings',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'settings-form',
          component: 'settings-form',
          position: 'main',
        },
      ],
    },
    // Admin Dashboard
    {
      path: '/admin',
      name: 'Admin',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
              { label: 'Categories', path: '/admin/categories', icon: 'Folder' },
              { label: 'Forums', path: '/admin/forums', icon: 'MessageSquare' },
              { label: 'Users', path: '/admin/users', icon: 'Users' },
              { label: 'Reports', path: '/admin/reports', icon: 'Flag' },
              { label: 'Badges', path: '/admin/badges', icon: 'Award' },
              { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['total_members', 'total_topics', 'total_posts', 'active_today'],
          },
        },
        {
          id: 'recent-reports',
          component: 'report-list',
          position: 'main',
          props: {
            title: 'Recent Reports',
            limit: 5,
          },
        },
        {
          id: 'new-members',
          component: 'member-grid',
          entity: 'member',
          position: 'main',
          props: {
            title: 'New Members',
            limit: 6,
          },
        },
      ],
    },
    // Admin Categories
    {
      path: '/admin/categories',
      name: 'Manage Categories',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'category-table',
          component: 'data-table',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Categories',
            showCreate: true,
            columns: ['name', 'description', 'forums_count', 'order'],
          },
        },
      ],
    },
    // Admin Users
    {
      path: '/admin/users',
      name: 'Manage Users',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'user-table',
          component: 'data-table',
          entity: 'member',
          position: 'main',
          props: {
            title: 'Members',
            columns: ['avatar', 'username', 'email', 'role', 'posts_count', 'joined_at', 'status'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Categories
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:id', entity: 'category', operation: 'get' },
    { method: 'POST', path: '/categories', entity: 'category', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/categories/:id', entity: 'category', operation: 'update', requiresAuth: true },

    // Forums
    { method: 'GET', path: '/forums', entity: 'forum', operation: 'list' },
    { method: 'GET', path: '/forums/:slug', entity: 'forum', operation: 'get' },
    { method: 'GET', path: '/forums/:slug/topics', entity: 'topic', operation: 'list' },
    { method: 'POST', path: '/forums', entity: 'forum', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/forums/:id', entity: 'forum', operation: 'update', requiresAuth: true },

    // Topics
    { method: 'GET', path: '/topics', entity: 'topic', operation: 'list' },
    { method: 'GET', path: '/topics/:id', entity: 'topic', operation: 'get' },
    { method: 'GET', path: '/topics/:id/posts', entity: 'post', operation: 'list' },
    { method: 'POST', path: '/topics', entity: 'topic', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/topics/:id', entity: 'topic', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/topics/:id', entity: 'topic', operation: 'delete', requiresAuth: true },
    { method: 'POST', path: '/topics/:id/subscribe', entity: 'topic', operation: 'custom', requiresAuth: true },
    { method: 'POST', path: '/topics/:id/pin', entity: 'topic', operation: 'custom', requiresAuth: true },
    { method: 'POST', path: '/topics/:id/lock', entity: 'topic', operation: 'custom', requiresAuth: true },

    // Posts
    { method: 'POST', path: '/posts', entity: 'post', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/posts/:id', entity: 'post', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/posts/:id', entity: 'post', operation: 'delete', requiresAuth: true },
    { method: 'POST', path: '/posts/:id/like', entity: 'post', operation: 'custom', requiresAuth: true },
    { method: 'POST', path: '/posts/:id/report', entity: 'post', operation: 'custom', requiresAuth: true },

    // Members
    { method: 'GET', path: '/members', entity: 'member', operation: 'list' },
    { method: 'GET', path: '/members/:username', entity: 'member', operation: 'get' },
    { method: 'PUT', path: '/members/:id', entity: 'member', operation: 'update', requiresAuth: true },

    // Search
    { method: 'GET', path: '/search', entity: 'topic', operation: 'list' },

    // Notifications
    { method: 'GET', path: '/notifications', entity: 'notification', operation: 'list', requiresAuth: true },
    { method: 'PATCH', path: '/notifications/read-all', entity: 'notification', operation: 'update', requiresAuth: true },

    // Tags
    { method: 'GET', path: '/tags', entity: 'tag', operation: 'list' },
    { method: 'GET', path: '/tags/:slug/topics', entity: 'topic', operation: 'list' },
  ],

  entityConfig: {
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'order', type: 'integer' },
        { name: 'is_visible', type: 'boolean' },
        { name: 'forums_count', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'forum' },
      ],
    },
    forum: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'order', type: 'integer' },
        { name: 'is_visible', type: 'boolean' },
        { name: 'is_locked', type: 'boolean' },
        { name: 'topics_count', type: 'integer' },
        { name: 'posts_count', type: 'integer' },
        { name: 'last_post_at', type: 'datetime' },
        { name: 'permissions', type: 'json' },
        { name: 'parent_id', type: 'string' }, // Self-reference for subforums (nullable FK handled at app level)
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'topic' },
        // Note: parent_id is a self-reference field, not a relationship, to avoid circular dependency
      ],
    },
    topic: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'type', type: 'enum' },
        { name: 'status', type: 'enum' },
        { name: 'is_pinned', type: 'boolean' },
        { name: 'is_locked', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'views_count', type: 'integer' },
        { name: 'posts_count', type: 'integer' },
        { name: 'likes_count', type: 'integer' },
        { name: 'last_post_at', type: 'datetime' },
        { name: 'attachments', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'forum' },
        { type: 'belongsTo', target: 'member' },
        { type: 'hasMany', target: 'post' },
        { type: 'hasMany', target: 'tag' },
      ],
    },
    post: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'is_solution', type: 'boolean' },
        { name: 'likes_count', type: 'integer' },
        { name: 'edit_count', type: 'integer' },
        { name: 'edited_at', type: 'datetime' },
        { name: 'ip_address', type: 'string' },
        { name: 'attachments', type: 'json' },
        { name: 'is_hidden', type: 'boolean' },
        { name: 'parent_id', type: 'string' }, // Self-reference for replies (nullable FK handled at app level)
      ],
      relationships: [
        { type: 'belongsTo', target: 'topic' },
        { type: 'belongsTo', target: 'member' },
        // Note: parent_id is a self-reference field, not a relationship, to avoid circular dependency
      ],
    },
    member: {
      defaultFields: [
        { name: 'username', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'display_name', type: 'string' },
        { name: 'avatar_url', type: 'image' },
        { name: 'cover_url', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'website', type: 'url' },
        { name: 'social_links', type: 'json' },
        { name: 'role', type: 'enum', required: true },
        { name: 'status', type: 'enum' },
        { name: 'reputation', type: 'integer' },
        { name: 'topics_count', type: 'integer' },
        { name: 'posts_count', type: 'integer' },
        { name: 'likes_received', type: 'integer' },
        { name: 'last_seen_at', type: 'datetime' },
        { name: 'signature', type: 'text' },
        { name: 'preferences', type: 'json' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'banned_until', type: 'datetime' },
        { name: 'ban_reason', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'topic' },
        { type: 'hasMany', target: 'post' },
        { type: 'hasMany', target: 'notification' },
        { type: 'hasMany', target: 'badge' },
      ],
    },
    tag: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'color', type: 'string' },
        { name: 'topics_count', type: 'integer' },
      ],
      relationships: [],
    },
    notification: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'data', type: 'json' },
        { name: 'is_read', type: 'boolean' },
        { name: 'read_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'topic' },
        { type: 'belongsTo', target: 'post' },
      ],
    },
    badge: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'criteria', type: 'json' },
        { name: 'points', type: 'integer' },
        { name: 'is_automatic', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default forumBlueprint;
