/**
 * Categories Feature Definition
 *
 * Content categorization with hierarchical categories,
 * navigation, and filtering.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CATEGORIES_FEATURE: FeatureDefinition = {
  id: 'categories',
  name: 'Categories',
  category: 'content',
  description: 'Hierarchical content categories with navigation and filtering',
  icon: 'folder-tree',

  includedInAppTypes: [
    'blog',
    'news-site',
    'ecommerce',
    'marketplace',
    'directory',
    'knowledge-base',
    'wiki',
    'forum',
    'classifieds',
    'job-board',
    'real-estate',
    'recipe-site',
  ],

  activationKeywords: [
    'categories',
    'category',
    'taxonomy',
    'classification',
    'organize content',
    'content hierarchy',
    'subcategories',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'categories-list',
      route: '/categories',
      section: 'frontend',
      title: 'Categories',
      authRequired: false,
      templateId: 'categories-list',
      components: [
        'category-grid',
        'category-card',
        'category-tree',
      ],
      layout: 'default',
    },
    {
      id: 'category-page',
      route: '/categories/:slug',
      section: 'frontend',
      title: 'Category',
      authRequired: false,
      templateId: 'category-page',
      components: [
        'category-header',
        'subcategories',
        'category-content',
        'breadcrumb',
      ],
      layout: 'default',
    },
    {
      id: 'admin-categories',
      route: '/admin/categories',
      section: 'admin',
      title: 'Manage Categories',
      authRequired: true,
      templateId: 'admin-categories',
      components: [
        'category-tree-editor',
        'category-form',
        'drag-drop-reorder',
        'category-stats',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Display
    'category-grid',
    'category-card',
    'category-tree',
    'subcategories',
    'breadcrumb',

    // Category page
    'category-header',
    'category-content',
    'category-image',

    // Navigation
    'category-nav',
    'category-dropdown',
    'category-filter',

    // Admin
    'category-tree-editor',
    'category-form',
    'drag-drop-reorder',
    'category-stats',
  ],

  entities: [
    {
      name: 'categories',
      displayName: 'Categories',
      description: 'Content categories',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', unique: true },
        { name: 'description', type: 'text' },
        { name: 'parent_id', type: 'uuid', references: { table: 'categories' } },
        { name: 'image_url', type: 'text' },
        { name: 'sort_order', type: 'integer', default: '0' },
        { name: 'is_active', type: 'boolean', default: 'true' },
        { name: 'item_count', type: 'integer', default: '0' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'category_items',
      displayName: 'Category Items',
      description: 'Items in categories (junction table)',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'category_id', type: 'uuid', required: true, references: { table: 'categories' } },
        { name: 'item_id', type: 'uuid', required: true },
        { name: 'item_type', type: 'text', required: true },
        { name: 'sort_order', type: 'integer', default: '0' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/categories',
      auth: false,
      handler: 'crud',
      entity: 'categories',
      description: 'List categories',
    },
    {
      method: 'GET',
      path: '/categories/:slug',
      auth: false,
      handler: 'crud',
      entity: 'categories',
      description: 'Get category',
    },
    {
      method: 'POST',
      path: '/categories',
      auth: true,
      handler: 'crud',
      entity: 'categories',
      description: 'Create category',
    },
    {
      method: 'PUT',
      path: '/categories/:id',
      auth: true,
      handler: 'crud',
      entity: 'categories',
      description: 'Update category',
    },
    {
      method: 'DELETE',
      path: '/categories/:id',
      auth: true,
      handler: 'crud',
      entity: 'categories',
      description: 'Delete category',
    },
    {
      method: 'GET',
      path: '/categories/:slug/items',
      auth: false,
      handler: 'custom',
      entity: 'category_items',
      description: 'Get category items',
    },
    {
      method: 'GET',
      path: '/categories/tree',
      auth: false,
      handler: 'custom',
      entity: 'categories',
      description: 'Get category tree',
    },
    {
      method: 'POST',
      path: '/categories/reorder',
      auth: true,
      handler: 'custom',
      entity: 'categories',
      description: 'Reorder categories',
    },
  ],

  config: [
    {
      key: 'maxDepth',
      label: 'Max Category Depth',
      type: 'number',
      default: 3,
      description: 'Maximum nesting level',
    },
    {
      key: 'showCounts',
      label: 'Show Item Counts',
      type: 'boolean',
      default: true,
      description: 'Display item count per category',
    },
    {
      key: 'allowEmpty',
      label: 'Allow Empty Categories',
      type: 'boolean',
      default: true,
      description: 'Show categories with no items',
    },
    {
      key: 'showImages',
      label: 'Show Category Images',
      type: 'boolean',
      default: true,
      description: 'Display images for categories',
    },
  ],
};
