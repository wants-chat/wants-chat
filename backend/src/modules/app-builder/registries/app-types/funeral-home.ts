/**
 * Funeral Home App Type Definition
 *
 * Complete definition for funeral homes and mortuary services.
 * Essential for funeral homes, mortuaries, and memorial services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FUNERAL_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'funeral-home',
  name: 'Funeral Home',
  category: 'religious',
  description: 'Funeral home platform with arrangement scheduling, memorial pages, pricing packages, and aftercare support',
  icon: 'heart',

  keywords: [
    'funeral home',
    'mortuary',
    'funeral software',
    'funeral services',
    'memorial services',
    'funeral management',
    'cremation services',
    'funeral arrangements',
    'funeral scheduling',
    'obituaries',
    'funeral crm',
    'burial services',
    'funeral business',
    'visitation',
    'funeral pos',
    'embalming',
    'funeral operations',
    'funeral planning',
    'funeral home services',
    'grief support',
  ],

  synonyms: [
    'funeral home platform',
    'funeral home software',
    'mortuary software',
    'funeral services software',
    'funeral management software',
    'cremation services software',
    'funeral arrangement software',
    'memorial services software',
    'funeral planning software',
    'funeral operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'funeral insurance'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Planning and memorials' },
    { id: 'admin', name: 'Funeral Dashboard', enabled: true, basePath: '/admin', requiredRole: 'director', layout: 'admin', description: 'Cases and services' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Funeral Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'religious',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a funeral home management platform',
    'Create a mortuary services app',
    'I need a funeral arrangement scheduling system',
    'Build a memorial and obituary platform',
    'Create a funeral planning app',
  ],
};
