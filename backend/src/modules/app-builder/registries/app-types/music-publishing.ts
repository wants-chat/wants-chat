/**
 * Music Publishing App Type Definition
 *
 * Complete definition for music publishing company operations.
 * Essential for music publishers, sync licensing, and rights management companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_PUBLISHING_APP_TYPE: AppTypeDefinition = {
  id: 'music-publishing',
  name: 'Music Publishing',
  category: 'entertainment',
  description: 'Music publishing platform with catalog management, rights tracking, royalty accounting, and sync licensing',
  icon: 'music',

  keywords: [
    'music publishing',
    'music publisher',
    'music publishing software',
    'sync licensing',
    'rights management',
    'music publishing management',
    'catalog management',
    'music publishing practice',
    'music publishing scheduling',
    'rights tracking',
    'music publishing crm',
    'royalty accounting',
    'music publishing business',
    'sync licensing deals',
    'music publishing pos',
    'songwriter royalties',
    'music publishing operations',
    'performance rights',
    'music publishing platform',
    'mechanical royalties',
  ],

  synonyms: [
    'music publishing platform',
    'music publishing software',
    'music publisher software',
    'sync licensing software',
    'rights management software',
    'catalog management software',
    'music publishing practice software',
    'rights tracking software',
    'royalty accounting software',
    'songwriter royalties software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Writer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Catalog and royalties' },
    { id: 'admin', name: 'Publisher Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Catalog and licensing' },
  ],

  roles: [
    { id: 'admin', name: 'Publisher Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Catalog Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/catalog' },
    { id: 'coordinator', name: 'Rights Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/licensing' },
    { id: 'writer', name: 'Songwriter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a music publishing platform',
    'Create a sync licensing portal',
    'I need a royalty management system',
    'Build a catalog and rights platform',
    'Create a songwriter royalty app',
  ],
};
