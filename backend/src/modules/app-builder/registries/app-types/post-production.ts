/**
 * Post Production App Type Definition
 *
 * Complete definition for post-production facility operations.
 * Essential for post houses, editing suites, and color grading facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POST_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'post-production',
  name: 'Post Production',
  category: 'entertainment',
  description: 'Post-production platform with edit suite booking, project tracking, media management, and client review',
  icon: 'film',

  keywords: [
    'post production',
    'post house',
    'post production software',
    'editing suite',
    'color grading',
    'post production management',
    'edit suite booking',
    'post production practice',
    'post production scheduling',
    'project tracking',
    'post production crm',
    'media management',
    'post production business',
    'client review',
    'post production pos',
    'finishing',
    'post production operations',
    'conform',
    'post production platform',
    'dailies',
  ],

  synonyms: [
    'post production platform',
    'post production software',
    'post house software',
    'editing suite software',
    'color grading software',
    'edit suite booking software',
    'post production practice software',
    'project tracking software',
    'media management software',
    'finishing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and reviews' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Suites and projects' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'senior-editor', name: 'Senior Editor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'editor', name: 'Editor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/suites' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a post-production platform',
    'Create a post house portal',
    'I need a post-production management system',
    'Build an editing suite booking platform',
    'Create a client review and delivery app',
  ],
};
