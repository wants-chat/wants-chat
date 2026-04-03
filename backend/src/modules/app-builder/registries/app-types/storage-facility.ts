/**
 * Storage Facility App Type Definition
 *
 * Complete definition for self-storage facility operations.
 * Essential for storage facilities, mini storage, and climate-controlled storage.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORAGE_FACILITY_APP_TYPE: AppTypeDefinition = {
  id: 'storage-facility',
  name: 'Storage Facility',
  category: 'property',
  description: 'Storage facility platform with unit management, rental automation, access control, and payment processing',
  icon: 'warehouse',

  keywords: [
    'storage facility',
    'self storage',
    'storage facility software',
    'mini storage',
    'climate controlled',
    'storage facility management',
    'unit management',
    'storage facility practice',
    'storage facility scheduling',
    'rental automation',
    'storage facility crm',
    'access control',
    'storage facility business',
    'payment processing',
    'storage facility pos',
    'rv storage',
    'storage facility operations',
    'boat storage',
    'storage facility platform',
    'vehicle storage',
  ],

  synonyms: [
    'storage facility platform',
    'storage facility software',
    'self storage software',
    'mini storage software',
    'climate controlled software',
    'unit management software',
    'storage facility practice software',
    'rental automation software',
    'access control software',
    'rv storage software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Units and rentals' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Units and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Facility Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/units' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'tenant', name: 'Tenant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'payments',
    'invoicing',
    'notifications',
    'search',
    'messaging',
    'documents',
    'lease-management',
    'rent-collection',
    'maintenance-requests',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
    'mls-integration',
    'open-houses',
    'tenant-screening',
    'property-listings',
  ],

  incompatibleFeatures: ['restaurant-tables', 'medical-records', 'gym-memberships'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'property',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
    'Build a storage facility platform',
    'Create a self-storage management app',
    'I need a mini storage system',
    'Build a storage rental business app',
    'Create a storage facility portal',
  ],
};
