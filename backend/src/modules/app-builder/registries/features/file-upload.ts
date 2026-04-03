/**
 * File Upload Feature Definition
 *
 * Complete file upload, storage, and media management functionality
 * for various application types.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const FILE_UPLOAD_FEATURE: FeatureDefinition = {
  id: 'file-upload',
  name: 'File Upload',
  category: 'utility',
  description: 'File upload, storage, and media management',
  icon: 'upload',

  includedInAppTypes: [
    'ecommerce',
    'cms',
    'social',
    'healthcare',
    'education',
    'saas',
    'marketplace',
    'blog',
    'portfolio',
    'crm',
    'project-management',
    'real-estate',
    'job-board',
    'document-management',
    'file-sharing',
    'collaboration',
    'knowledge-base',
    'helpdesk',
    'event-management',
    'booking',
    'dating',
    'forum',
    'community',
    'media-streaming',
    'photography',
    'travel',
    'food-delivery',
    'inventory',
  ],

  activationKeywords: [
    'file upload',
    'upload',
    'files',
    'media',
    'attachments',
    'documents',
    'images',
    'file manager',
    'media library',
    'file storage',
    'upload files',
    'image upload',
    'document upload',
    'file hosting',
    'media management',
    'asset management',
    'file browser',
    'dropzone',
    'drag and drop',
    'file picker',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'media-library',
      route: '/media',
      section: 'frontend',
      title: 'Media Library',
      authRequired: true,
      templateId: 'media-library',
      components: [
        'file-gallery',
        'file-uploader',
        'file-preview',
        'file-list',
        'drag-drop-zone',
      ],
      layout: 'dashboard',
    },
    {
      id: 'file-manager',
      route: '/files',
      section: 'frontend',
      title: 'File Manager',
      authRequired: true,
      templateId: 'file-manager',
      components: [
        'file-list',
        'file-uploader',
        'file-preview',
        'drag-drop-zone',
        'progress-bar',
      ],
      layout: 'dashboard',
    },
    {
      id: 'upload-page',
      route: '/upload',
      section: 'frontend',
      title: 'Upload Files',
      authRequired: true,
      templateId: 'upload-page',
      components: [
        'file-uploader',
        'drag-drop-zone',
        'progress-bar',
        'file-list',
      ],
      layout: 'default',
    },
    {
      id: 'file-detail',
      route: '/files/:id',
      section: 'frontend',
      title: 'File Details',
      authRequired: true,
      templateId: 'file-detail',
      components: [
        'file-preview',
        'file-info',
        'image-cropper',
      ],
      layout: 'default',
    },
    {
      id: 'admin-media',
      route: '/admin/media',
      section: 'admin',
      title: 'Media Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-media-library',
      components: [
        'file-gallery',
        'file-uploader',
        'file-list',
        'file-stats',
        'storage-usage',
      ],
      layout: 'dashboard',
    },
  ],

  components: [
    // Upload components
    'file-uploader',
    'drag-drop-zone',
    'progress-bar',
    'upload-button',
    'multi-file-uploader',

    // Display components
    'file-gallery',
    'file-list',
    'file-preview',
    'file-thumbnail',
    'file-card',
    'file-grid',

    // Image components
    'image-cropper',
    'image-viewer',
    'image-editor',
    'image-gallery',

    // Info components
    'file-info',
    'file-metadata',
    'file-stats',
    'storage-usage',

    // Navigation components
    'folder-tree',
    'breadcrumb-nav',
    'file-search',
    'file-filter',

    // Action components
    'file-actions',
    'bulk-actions',
    'share-dialog',
    'download-button',
  ],

  entities: [
    {
      name: 'files',
      displayName: 'Files',
      description: 'Uploaded file metadata and information',
      isCore: true,
    },
    {
      name: 'uploads',
      displayName: 'Uploads',
      description: 'Upload session tracking and progress',
      isCore: true,
    },
    {
      name: 'folders',
      displayName: 'Folders',
      description: 'Folder structure for organizing files',
      isCore: false,
    },
    {
      name: 'file_shares',
      displayName: 'File Shares',
      description: 'Shared file links and permissions',
      isCore: false,
    },
  ],

  apiRoutes: [
    // File Upload Routes
    {
      method: 'POST',
      path: '/files/upload',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Upload a file',
    },
    {
      method: 'POST',
      path: '/files/upload/chunk',
      auth: true,
      handler: 'custom',
      entity: 'uploads',
      description: 'Upload file chunk for large files',
    },
    {
      method: 'POST',
      path: '/files/upload/complete',
      auth: true,
      handler: 'custom',
      entity: 'uploads',
      description: 'Complete chunked upload',
    },

    // File CRUD Routes
    {
      method: 'GET',
      path: '/files',
      auth: true,
      handler: 'crud',
      entity: 'files',
      operation: 'list',
      description: 'List all files',
    },
    {
      method: 'GET',
      path: '/files/:id',
      auth: true,
      handler: 'crud',
      entity: 'files',
      operation: 'get',
      description: 'Get file details',
    },
    {
      method: 'PUT',
      path: '/files/:id',
      auth: true,
      handler: 'crud',
      entity: 'files',
      operation: 'update',
      description: 'Update file metadata',
    },
    {
      method: 'DELETE',
      path: '/files/:id',
      auth: true,
      handler: 'crud',
      entity: 'files',
      operation: 'delete',
      description: 'Delete a file',
    },

    // File Download/Access Routes
    {
      method: 'GET',
      path: '/files/:id/download',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Download a file',
    },
    {
      method: 'GET',
      path: '/files/:id/thumbnail',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Get file thumbnail',
    },
    {
      method: 'GET',
      path: '/files/:id/preview',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Get file preview',
    },

    // Folder Routes
    {
      method: 'GET',
      path: '/folders',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      operation: 'list',
      description: 'List folders',
    },
    {
      method: 'POST',
      path: '/folders',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      operation: 'create',
      description: 'Create a folder',
    },
    {
      method: 'PUT',
      path: '/folders/:id',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      operation: 'update',
      description: 'Update a folder',
    },
    {
      method: 'DELETE',
      path: '/folders/:id',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      operation: 'delete',
      description: 'Delete a folder',
    },

    // File Sharing Routes
    {
      method: 'POST',
      path: '/files/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'file_shares',
      description: 'Create share link for file',
    },
    {
      method: 'DELETE',
      path: '/files/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'file_shares',
      description: 'Remove share link',
    },
    {
      method: 'GET',
      path: '/shared/:token',
      auth: false,
      handler: 'custom',
      entity: 'file_shares',
      description: 'Access shared file',
    },

    // Bulk Operations
    {
      method: 'POST',
      path: '/files/bulk/delete',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Delete multiple files',
    },
    {
      method: 'POST',
      path: '/files/bulk/move',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Move multiple files to folder',
    },

    // Storage Stats
    {
      method: 'GET',
      path: '/storage/usage',
      auth: true,
      handler: 'custom',
      entity: 'files',
      description: 'Get storage usage statistics',
    },
  ],

  config: [
    {
      key: 'maxFileSize',
      label: 'Maximum File Size (MB)',
      type: 'number',
      default: 10,
      description: 'Maximum allowed file size in megabytes',
    },
    {
      key: 'allowedTypes',
      label: 'Allowed File Types',
      type: 'string',
      default: 'image/*,application/pdf,.doc,.docx,.xls,.xlsx',
      description: 'Comma-separated list of allowed MIME types or extensions',
    },
    {
      key: 'enableCompression',
      label: 'Enable Image Compression',
      type: 'boolean',
      default: true,
      description: 'Automatically compress uploaded images',
    },
    {
      key: 'maxStoragePerUser',
      label: 'Max Storage Per User (MB)',
      type: 'number',
      default: 1000,
      description: 'Maximum storage quota per user in megabytes',
    },
    {
      key: 'enableThumbnails',
      label: 'Generate Thumbnails',
      type: 'boolean',
      default: true,
      description: 'Automatically generate thumbnails for images',
    },
    {
      key: 'thumbnailSize',
      label: 'Thumbnail Size (px)',
      type: 'number',
      default: 200,
      description: 'Size of generated thumbnails in pixels',
    },
    {
      key: 'enableVersioning',
      label: 'Enable File Versioning',
      type: 'boolean',
      default: false,
      description: 'Keep previous versions of updated files',
    },
    {
      key: 'storageProvider',
      label: 'Storage Provider',
      type: 'select',
      default: 'local',
      options: [
        { value: 'local', label: 'Local Storage' },
        { value: 's3', label: 'Amazon S3' },
        { value: 'cloudflare', label: 'Cloudflare R2' },
        { value: 'gcs', label: 'Google Cloud Storage' },
      ],
      description: 'Where to store uploaded files',
    },
  ],
};
