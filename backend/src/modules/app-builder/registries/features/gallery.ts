/**
 * Gallery Feature Definition
 *
 * Image galleries, photo albums, and portfolio displays
 * with lightbox, albums, and slideshow support.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const GALLERY_FEATURE: FeatureDefinition = {
  id: 'gallery',
  name: 'Gallery',
  category: 'content',
  description: 'Image galleries with albums, lightbox, and slideshow',
  icon: 'image',

  includedInAppTypes: [
    'portfolio',
    'photography',
    'art-gallery',
    'wedding',
    'event-photography',
    'real-estate',
    'ecommerce',
    'fashion',
    'design-agency',
    'architecture',
    'interior-design',
    'travel',
    'restaurant',
    'hotel',
    'museum',
    'nonprofit',
  ],

  activationKeywords: [
    'gallery',
    'photo gallery',
    'image gallery',
    'portfolio',
    'photos',
    'albums',
    'lightbox',
    'slideshow',
    'photography',
    'pictures',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth', 'file-upload'],
  conflicts: [],

  pages: [
    {
      id: 'gallery-list',
      route: '/gallery',
      section: 'frontend',
      title: 'Gallery',
      authRequired: false,
      templateId: 'gallery-list',
      components: [
        'gallery-header',
        'albums-grid',
        'album-card',
        'category-filter',
      ],
      layout: 'default',
    },
    {
      id: 'album-view',
      route: '/gallery/:albumId',
      section: 'frontend',
      title: 'Album',
      authRequired: false,
      templateId: 'album-view',
      components: [
        'album-header',
        'image-grid',
        'lightbox',
        'slideshow-button',
      ],
      layout: 'default',
    },
    {
      id: 'admin-gallery',
      route: '/admin/gallery',
      section: 'admin',
      title: 'Manage Gallery',
      authRequired: true,
      templateId: 'admin-gallery',
      components: [
        'albums-manager',
        'upload-zone',
        'image-editor',
        'bulk-upload',
      ],
      layout: 'admin',
    },
    {
      id: 'admin-album',
      route: '/admin/gallery/:albumId',
      section: 'admin',
      title: 'Edit Album',
      authRequired: true,
      templateId: 'admin-album',
      components: [
        'album-settings',
        'image-organizer',
        'drag-drop-sort',
        'image-details',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Gallery display
    'gallery-header',
    'albums-grid',
    'album-card',
    'image-grid',
    'masonry-grid',

    // Album view
    'album-header',
    'lightbox',
    'slideshow-button',
    'slideshow-viewer',

    // Admin
    'albums-manager',
    'upload-zone',
    'bulk-upload',
    'image-editor',
    'image-cropper',

    // Album editor
    'album-settings',
    'image-organizer',
    'drag-drop-sort',
    'image-details',
    'image-caption',

    // Filters
    'category-filter',
    'date-filter',
  ],

  entities: [
    {
      name: 'albums',
      displayName: 'Albums',
      description: 'Photo albums',
      isCore: true,
    },
    {
      name: 'gallery_images',
      displayName: 'Images',
      description: 'Gallery images',
      isCore: true,
    },
    {
      name: 'gallery_categories',
      displayName: 'Categories',
      description: 'Gallery categories',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/albums',
      auth: false,
      handler: 'crud',
      entity: 'albums',
      description: 'List albums',
    },
    {
      method: 'GET',
      path: '/albums/:id',
      auth: false,
      handler: 'crud',
      entity: 'albums',
      description: 'Get album',
    },
    {
      method: 'POST',
      path: '/albums',
      auth: true,
      handler: 'crud',
      entity: 'albums',
      description: 'Create album',
    },
    {
      method: 'PUT',
      path: '/albums/:id',
      auth: true,
      handler: 'crud',
      entity: 'albums',
      description: 'Update album',
    },
    {
      method: 'DELETE',
      path: '/albums/:id',
      auth: true,
      handler: 'crud',
      entity: 'albums',
      description: 'Delete album',
    },
    {
      method: 'GET',
      path: '/albums/:id/images',
      auth: false,
      handler: 'crud',
      entity: 'gallery_images',
      description: 'Get album images',
    },
    {
      method: 'POST',
      path: '/albums/:id/images',
      auth: true,
      handler: 'crud',
      entity: 'gallery_images',
      description: 'Add images to album',
    },
    {
      method: 'PUT',
      path: '/images/:id',
      auth: true,
      handler: 'crud',
      entity: 'gallery_images',
      description: 'Update image',
    },
    {
      method: 'DELETE',
      path: '/images/:id',
      auth: true,
      handler: 'crud',
      entity: 'gallery_images',
      description: 'Delete image',
    },
    {
      method: 'POST',
      path: '/albums/:id/reorder',
      auth: true,
      handler: 'custom',
      entity: 'gallery_images',
      description: 'Reorder album images',
    },
  ],

  config: [
    {
      key: 'thumbnailSize',
      label: 'Thumbnail Size',
      type: 'number',
      default: 300,
      description: 'Thumbnail width in pixels',
    },
    {
      key: 'enableDownload',
      label: 'Allow Downloads',
      type: 'boolean',
      default: false,
      description: 'Allow visitors to download images',
    },
    {
      key: 'watermarkEnabled',
      label: 'Enable Watermark',
      type: 'boolean',
      default: false,
      description: 'Add watermark to images',
    },
    {
      key: 'layoutStyle',
      label: 'Default Layout',
      type: 'string',
      default: 'grid',
      description: 'Default gallery layout (grid, masonry)',
    },
  ],
};
