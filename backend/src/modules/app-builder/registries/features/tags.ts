/**
 * Tags Feature Definition
 *
 * Tagging system for organizing and discovering content
 * with tag clouds, filtering, and suggestions.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const TAGS_FEATURE: FeatureDefinition = {
  id: 'tags',
  name: 'Tags',
  category: 'content',
  description: 'Content tagging with tag clouds, filtering, and suggestions',
  icon: 'tag',

  includedInAppTypes: [
    'blog',
    'news-site',
    'forum',
    'knowledge-base',
    'wiki',
    'ecommerce',
    'marketplace',
    'portfolio',
    'gallery',
    'video-platform',
    'bookmark-manager',
    'note-taking',
  ],

  activationKeywords: [
    'tags',
    'tagging',
    'labels',
    'keywords',
    'hashtags',
    'tag cloud',
    'topic tags',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'tags-list',
      route: '/tags',
      section: 'frontend',
      title: 'Tags',
      authRequired: false,
      templateId: 'tags-list',
      components: [
        'tag-cloud',
        'tags-grid',
        'popular-tags',
        'search-tags',
      ],
      layout: 'default',
    },
    {
      id: 'tag-page',
      route: '/tags/:tag',
      section: 'frontend',
      title: 'Tagged Content',
      authRequired: false,
      templateId: 'tag-page',
      components: [
        'tag-header',
        'tagged-content-list',
        'related-tags',
      ],
      layout: 'default',
    },
    {
      id: 'admin-tags',
      route: '/admin/tags',
      section: 'admin',
      title: 'Manage Tags',
      authRequired: true,
      templateId: 'admin-tags',
      components: [
        'tags-table',
        'merge-tags',
        'delete-tag',
        'tag-stats',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Display
    'tag-cloud',
    'tags-grid',
    'tag-badge',
    'popular-tags',

    // Tag page
    'tag-header',
    'tagged-content-list',
    'related-tags',

    // Input
    'tags-input',
    'tag-suggestions',
    'search-tags',

    // Admin
    'tags-table',
    'merge-tags',
    'delete-tag',
    'tag-stats',
  ],

  entities: [
    {
      name: 'tags',
      displayName: 'Tags',
      description: 'Content tags',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', unique: true },
        { name: 'description', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'usage_count', type: 'integer', default: '0' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'taggables',
      displayName: 'Taggables',
      description: 'Tag associations (polymorphic junction table)',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'tag_id', type: 'uuid', required: true, references: { table: 'tags' } },
        { name: 'taggable_id', type: 'uuid', required: true },
        { name: 'taggable_type', type: 'text', required: true },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/tags',
      auth: false,
      handler: 'crud',
      entity: 'tags',
      description: 'List tags',
    },
    {
      method: 'GET',
      path: '/tags/:slug',
      auth: false,
      handler: 'crud',
      entity: 'tags',
      description: 'Get tag',
    },
    {
      method: 'POST',
      path: '/tags',
      auth: true,
      handler: 'crud',
      entity: 'tags',
      description: 'Create tag',
    },
    {
      method: 'PUT',
      path: '/tags/:id',
      auth: true,
      handler: 'crud',
      entity: 'tags',
      description: 'Update tag',
    },
    {
      method: 'DELETE',
      path: '/tags/:id',
      auth: true,
      handler: 'crud',
      entity: 'tags',
      description: 'Delete tag',
    },
    {
      method: 'GET',
      path: '/tags/:slug/content',
      auth: false,
      handler: 'custom',
      entity: 'taggables',
      description: 'Get tagged content',
    },
    {
      method: 'GET',
      path: '/tags/popular',
      auth: false,
      handler: 'custom',
      entity: 'tags',
      description: 'Get popular tags',
    },
    {
      method: 'POST',
      path: '/tags/merge',
      auth: true,
      handler: 'custom',
      entity: 'tags',
      description: 'Merge tags',
    },
  ],

  config: [
    {
      key: 'maxTagsPerItem',
      label: 'Max Tags Per Item',
      type: 'number',
      default: 10,
      description: 'Maximum tags per content item',
    },
    {
      key: 'suggestionsCount',
      label: 'Suggestions Count',
      type: 'number',
      default: 5,
      description: 'Number of tag suggestions',
    },
    {
      key: 'allowUserCreated',
      label: 'Allow User-Created Tags',
      type: 'boolean',
      default: true,
      description: 'Let users create new tags',
    },
    {
      key: 'caseSensitive',
      label: 'Case Sensitive',
      type: 'boolean',
      default: false,
      description: 'Treat tags as case sensitive',
    },
  ],
};
