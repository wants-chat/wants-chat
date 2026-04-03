/**
 * Public Records App Type Definition
 *
 * Complete definition for public records and records management applications.
 * Essential for clerks offices, records departments, and document repositories.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_RECORDS_APP_TYPE: AppTypeDefinition = {
  id: 'public-records',
  name: 'Public Records',
  category: 'government',
  description: 'Public records platform with document search, records requests, vital records, and archive management',
  icon: 'archive',

  keywords: [
    'public records',
    'records management',
    'vital records',
    'birth certificate',
    'marriage license',
    'death certificate',
    'records request',
    'foia request',
    'public documents',
    'records search',
    'records portal',
    'clerk office',
    'document archive',
    'property records',
    'court records',
    'records software',
    'records database',
    'records retention',
    'records access',
    'open records',
  ],

  synonyms: [
    'public records platform',
    'records management software',
    'vital records software',
    'records request software',
    'public records software',
    'document archive software',
    'records portal software',
    'clerk office software',
    'records search platform',
    'records database software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'music records'],

  sections: [
    { id: 'frontend', name: 'Records Portal', enabled: true, basePath: '/', layout: 'public', description: 'Search and request records' },
    { id: 'admin', name: 'Records Dashboard', enabled: true, basePath: '/admin', requiredRole: 'clerk', layout: 'admin', description: 'Records management' },
  ],

  roles: [
    { id: 'admin', name: 'Records Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Records Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/records' },
    { id: 'clerk', name: 'Records Clerk', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'archivist', name: 'Archivist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/archive' },
    { id: 'public', name: 'Public User', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'orders',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a public records portal',
    'Create a vital records system',
    'I need a records request app',
    'Build a document archive platform',
    'Create a clerk office system',
  ],
};
