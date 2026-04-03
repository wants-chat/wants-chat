/**
 * Boat Storage App Type Definition
 *
 * Complete definition for boat storage and dry dock facilities.
 * Essential for boat storage yards, dry stack, and indoor boat storage.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'boat-storage',
  name: 'Boat Storage',
  category: 'marine',
  description: 'Boat storage platform with space management, launch requests, winterization services, and access control',
  icon: 'warehouse',

  keywords: [
    'boat storage',
    'dry dock',
    'boat storage software',
    'dry stack',
    'boat yard',
    'boat storage management',
    'indoor storage',
    'boat storage facility',
    'boat storage scheduling',
    'outdoor storage',
    'boat storage crm',
    'rack storage',
    'boat storage business',
    'boat winterization',
    'boat storage pos',
    'shrink wrap',
    'boat storage operations',
    'launch service',
    'boat storage services',
    'marina storage',
  ],

  synonyms: [
    'boat storage platform',
    'boat storage software',
    'dry dock software',
    'dry stack software',
    'boat yard software',
    'indoor boat storage software',
    'boat storage facility software',
    'rack storage software',
    'marina storage software',
    'boat winterization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'self storage general'],

  sections: [
    { id: 'frontend', name: 'Owner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Storage and launches' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'attendant', layout: 'admin', description: 'Spaces and services' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Yard Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/spaces' },
    { id: 'attendant', name: 'Yard Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/launches' },
    { id: 'owner', name: 'Boat Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a boat storage facility platform',
    'Create a dry stack management app',
    'I need a boat yard scheduling system',
    'Build a marina storage rental platform',
    'Create a boat winterization service app',
  ],
};
