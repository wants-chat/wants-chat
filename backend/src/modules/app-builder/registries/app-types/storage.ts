/**
 * Storage Units App Type Definition
 *
 * Complete definition for self-storage and storage facility applications.
 * Essential for storage facilities, warehouse rentals, and self-storage businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'storage',
  name: 'Storage Units',
  category: 'real-estate',
  description: 'Self-storage platform with unit booking, access control, billing, and facility management',
  icon: 'warehouse',

  keywords: [
    'storage',
    'self storage',
    'storage units',
    'storage facility',
    'mini storage',
    'public storage',
    'extra space storage',
    'cubesmart',
    'life storage',
    'storage rental',
    'climate controlled storage',
    'vehicle storage',
    'boat storage',
    'rv storage',
    'warehouse storage',
    'business storage',
    'storage locker',
    'storage space',
    'storage container',
    'portable storage',
    'storage auction',
    'storage management',
  ],

  synonyms: [
    'storage platform',
    'storage software',
    'self storage app',
    'storage management system',
    'storage rental platform',
    'storage facility software',
    'storage booking',
    'storage reservation',
    'mini storage software',
    'storage unit app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Unit search and rental' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Facility and tenant management' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Facility Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/units' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/access' },
    { id: 'tenant', name: 'Tenant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-units' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
    'messaging',
    'documents',
    'lease-management',
    'rent-collection',
    'maintenance-requests',
  ],

  optionalFeatures: [
    'check-in',
    'analytics',
    'mls-integration',
    'open-houses',
    'tenant-screening',
    'property-listings',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'real-estate',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a self-storage management platform',
    'Create a storage unit booking system',
    'I need a storage facility management app',
    'Build a storage rental platform like Public Storage',
    'Create a storage units app with access control',
  ],
};
