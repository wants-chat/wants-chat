/**
 * CMS Feature Definition
 *
 * Content management system with page builder,
 * content blocks, and dynamic pages.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CMS_FEATURE: FeatureDefinition = {
  id: 'cms',
  name: 'CMS',
  category: 'content',
  description: 'Content management with page builder, blocks, and dynamic pages',
  icon: 'layout',

  includedInAppTypes: [
    'cms',
    'website-builder',
    'landing-page',
    'business-website',
    'portfolio',
    'agency',
    'nonprofit',
    'church',
    'school',
    'university',
    'government',
    'corporate',
    'marketing-site',
    'saas',
  ],

  activationKeywords: [
    'cms',
    'content management',
    'page builder',
    'website builder',
    'landing page',
    'dynamic pages',
    'content blocks',
    'squarespace',
    'wix',
    'webflow',
    'page editor',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'pages-list',
      route: '/admin/pages',
      section: 'admin',
      title: 'Pages',
      authRequired: true,
      templateId: 'pages-list',
      components: [
        'pages-tree',
        'page-card',
        'create-page-button',
        'page-status',
      ],
      layout: 'admin',
    },
    {
      id: 'page-editor',
      route: '/admin/pages/:id/edit',
      section: 'admin',
      title: 'Edit Page',
      authRequired: true,
      templateId: 'page-editor',
      components: [
        'page-builder',
        'block-library',
        'block-settings',
        'page-settings',
        'preview-button',
        'publish-button',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'blocks-library',
      route: '/admin/blocks',
      section: 'admin',
      title: 'Content Blocks',
      authRequired: true,
      templateId: 'blocks-library',
      components: [
        'blocks-grid',
        'block-preview',
        'create-block-button',
      ],
      layout: 'admin',
    },
    {
      id: 'menus-editor',
      route: '/admin/menus',
      section: 'admin',
      title: 'Navigation',
      authRequired: true,
      templateId: 'menus-editor',
      components: [
        'menu-tree',
        'menu-item-editor',
        'add-menu-item',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Page builder
    'page-builder',
    'block-library',
    'block-settings',
    'page-settings',
    'preview-button',
    'publish-button',

    // Block components
    'text-block',
    'image-block',
    'video-block',
    'gallery-block',
    'hero-block',
    'cta-block',
    'form-block',
    'testimonials-block',
    'pricing-block',
    'faq-block',

    // Pages list
    'pages-tree',
    'page-card',
    'create-page-button',
    'page-status',

    // Blocks library
    'blocks-grid',
    'block-preview',
    'create-block-button',

    // Navigation
    'menu-tree',
    'menu-item-editor',
    'add-menu-item',
  ],

  entities: [
    {
      name: 'pages',
      displayName: 'Pages',
      description: 'Site pages',
      isCore: true,
    },
    {
      name: 'blocks',
      displayName: 'Blocks',
      description: 'Content blocks',
      isCore: true,
    },
    {
      name: 'menus',
      displayName: 'Menus',
      description: 'Navigation menus',
      isCore: false,
    },
    {
      name: 'templates',
      displayName: 'Templates',
      description: 'Page templates',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/pages',
      auth: false,
      handler: 'crud',
      entity: 'pages',
      description: 'List pages',
    },
    {
      method: 'GET',
      path: '/pages/:slug',
      auth: false,
      handler: 'crud',
      entity: 'pages',
      description: 'Get page by slug',
    },
    {
      method: 'POST',
      path: '/pages',
      auth: true,
      handler: 'crud',
      entity: 'pages',
      description: 'Create page',
    },
    {
      method: 'PUT',
      path: '/pages/:id',
      auth: true,
      handler: 'crud',
      entity: 'pages',
      description: 'Update page',
    },
    {
      method: 'DELETE',
      path: '/pages/:id',
      auth: true,
      handler: 'crud',
      entity: 'pages',
      description: 'Delete page',
    },
    {
      method: 'POST',
      path: '/pages/:id/publish',
      auth: true,
      handler: 'custom',
      entity: 'pages',
      description: 'Publish page',
    },
    {
      method: 'GET',
      path: '/blocks',
      auth: true,
      handler: 'crud',
      entity: 'blocks',
      description: 'List blocks',
    },
    {
      method: 'POST',
      path: '/blocks',
      auth: true,
      handler: 'crud',
      entity: 'blocks',
      description: 'Create block',
    },
    {
      method: 'GET',
      path: '/menus',
      auth: false,
      handler: 'crud',
      entity: 'menus',
      description: 'Get navigation menus',
    },
    {
      method: 'PUT',
      path: '/menus/:id',
      auth: true,
      handler: 'crud',
      entity: 'menus',
      description: 'Update menu',
    },
  ],

  config: [
    {
      key: 'defaultTemplate',
      label: 'Default Page Template',
      type: 'string',
      default: 'blank',
      description: 'Default template for new pages',
    },
    {
      key: 'enableVersioning',
      label: 'Enable Page Versioning',
      type: 'boolean',
      default: true,
      description: 'Keep version history of pages',
    },
    {
      key: 'maxRevisions',
      label: 'Maximum Revisions',
      type: 'number',
      default: 10,
      description: 'Number of page revisions to keep',
    },
    {
      key: 'enableSEO',
      label: 'Enable SEO Settings',
      type: 'boolean',
      default: true,
      description: 'Show SEO settings on pages',
    },
  ],
};
