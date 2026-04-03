/**
 * Document Management App Type Definition
 *
 * Complete definition for document management and file sharing applications.
 * Essential for businesses needing file storage, sharing, and collaboration.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOCUMENT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'document-management',
  name: 'Document Management',
  category: 'business',
  description: 'Document management with file storage, sharing, versioning, and team collaboration',
  icon: 'folder-open',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'document management',
    'file management',
    'file sharing',
    'document sharing',
    'file storage',
    'cloud storage',
    'dms',
    'document system',
    'dropbox',
    'google drive',
    'box',
    'sharepoint',
    'onedrive',
    'file hosting',
    'document repository',
    'document storage',
    'file collaboration',
    'document collaboration',
    'version control',
    'file versioning',
    'document versioning',
    'digital documents',
    'paperless',
    'file cabinet',
    'document library',
    'knowledge base',
  ],

  synonyms: [
    'file manager',
    'document platform',
    'file platform',
    'document system',
    'file system',
    'content management',
    'file organizer',
    'document organizer',
    'file repository',
    'document vault',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'social media',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Document Portal',
      enabled: true,
      basePath: '/',
      layout: 'admin',
      description: 'Main document management interface',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'System administration and user management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'editor',
      name: 'Editor',
      level: 40,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/documents',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/documents',
    },
    {
      id: 'guest',
      name: 'Guest',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/shared',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'file-upload',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'check-in',
    'tags',
    'categories',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'business',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a document management system',
    'Create a file sharing app like Dropbox',
    'I need a document storage platform',
    'Build a file management app for my team',
    'Create a cloud storage application',
    'I want to build a document collaboration tool',
    'Make a file hosting app with version control',
  ],
};
