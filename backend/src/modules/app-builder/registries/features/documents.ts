/**
 * Documents Feature Definition
 *
 * Document management, file sharing, and knowledge base
 * with folders, versioning, and collaboration.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const DOCUMENTS_FEATURE: FeatureDefinition = {
  id: 'documents',
  name: 'Documents',
  category: 'content',
  description: 'Document management with folders, versioning, and sharing',
  icon: 'folder',

  includedInAppTypes: [
    'document-management',
    'knowledge-base',
    'wiki',
    'intranet',
    'team-collaboration',
    'project-management',
    'legal',
    'accounting',
    'hr-management',
    'education',
    'research',
    'healthcare',
    'real-estate',
    'construction',
    'government',
  ],

  activationKeywords: [
    'documents',
    'document management',
    'files',
    'file sharing',
    'knowledge base',
    'wiki',
    'dropbox',
    'google drive',
    'sharepoint',
    'file storage',
    'dms',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth', 'file-upload'],
  conflicts: [],

  pages: [
    {
      id: 'documents-list',
      route: '/documents',
      section: 'frontend',
      title: 'Documents',
      authRequired: true,
      templateId: 'documents-list',
      components: [
        'folder-tree',
        'documents-grid',
        'document-card',
        'breadcrumb',
        'upload-button',
      ],
      layout: 'default',
    },
    {
      id: 'document-view',
      route: '/documents/:id',
      section: 'frontend',
      title: 'Document',
      authRequired: true,
      templateId: 'document-view',
      components: [
        'document-viewer',
        'document-info',
        'version-history',
        'comments-panel',
        'share-button',
      ],
      layout: 'default',
    },
    {
      id: 'shared-with-me',
      route: '/documents/shared',
      section: 'frontend',
      title: 'Shared With Me',
      authRequired: true,
      templateId: 'shared-documents',
      components: [
        'shared-documents-list',
        'shared-by-filter',
      ],
      layout: 'default',
    },
    {
      id: 'admin-documents',
      route: '/admin/documents',
      section: 'admin',
      title: 'Document Settings',
      authRequired: true,
      templateId: 'admin-documents',
      components: [
        'storage-stats',
        'permissions-manager',
        'document-types',
        'retention-policies',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // List components
    'folder-tree',
    'documents-grid',
    'documents-list-view',
    'document-card',
    'breadcrumb',
    'upload-button',

    // Viewer
    'document-viewer',
    'pdf-viewer',
    'document-info',
    'version-history',
    'comments-panel',

    // Sharing
    'share-button',
    'share-modal',
    'permissions-picker',
    'shared-documents-list',
    'shared-by-filter',

    // Admin
    'storage-stats',
    'permissions-manager',
    'document-types',
    'retention-policies',

    // Actions
    'download-button',
    'rename-button',
    'move-button',
    'delete-button',
  ],

  entities: [
    {
      name: 'documents',
      displayName: 'Documents',
      description: 'Uploaded documents',
      isCore: true,
    },
    {
      name: 'folders',
      displayName: 'Folders',
      description: 'Document folders',
      isCore: true,
    },
    {
      name: 'document_versions',
      displayName: 'Versions',
      description: 'Document versions',
      isCore: false,
    },
    {
      name: 'document_shares',
      displayName: 'Shares',
      description: 'Shared documents',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/documents',
      auth: true,
      handler: 'crud',
      entity: 'documents',
      description: 'List documents',
    },
    {
      method: 'GET',
      path: '/documents/:id',
      auth: true,
      handler: 'crud',
      entity: 'documents',
      description: 'Get document',
    },
    {
      method: 'POST',
      path: '/documents',
      auth: true,
      handler: 'crud',
      entity: 'documents',
      description: 'Upload document',
    },
    {
      method: 'PUT',
      path: '/documents/:id',
      auth: true,
      handler: 'crud',
      entity: 'documents',
      description: 'Update document',
    },
    {
      method: 'DELETE',
      path: '/documents/:id',
      auth: true,
      handler: 'crud',
      entity: 'documents',
      description: 'Delete document',
    },
    {
      method: 'GET',
      path: '/folders',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      description: 'List folders',
    },
    {
      method: 'POST',
      path: '/folders',
      auth: true,
      handler: 'crud',
      entity: 'folders',
      description: 'Create folder',
    },
    {
      method: 'GET',
      path: '/documents/:id/versions',
      auth: true,
      handler: 'crud',
      entity: 'document_versions',
      description: 'Get document versions',
    },
    {
      method: 'POST',
      path: '/documents/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'document_shares',
      description: 'Share document',
    },
    {
      method: 'GET',
      path: '/documents/shared',
      auth: true,
      handler: 'custom',
      entity: 'document_shares',
      description: 'Get shared documents',
    },
    {
      method: 'POST',
      path: '/documents/:id/move',
      auth: true,
      handler: 'custom',
      entity: 'documents',
      description: 'Move document',
    },
  ],

  config: [
    {
      key: 'maxFileSize',
      label: 'Max File Size (MB)',
      type: 'number',
      default: 100,
      description: 'Maximum upload file size',
    },
    {
      key: 'allowedTypes',
      label: 'Allowed File Types',
      type: 'string',
      default: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt',
      description: 'Comma-separated list of allowed extensions',
    },
    {
      key: 'enableVersioning',
      label: 'Enable Versioning',
      type: 'boolean',
      default: true,
      description: 'Keep version history',
    },
    {
      key: 'retentionDays',
      label: 'Trash Retention (days)',
      type: 'number',
      default: 30,
      description: 'Days to keep deleted files',
    },
  ],
};
