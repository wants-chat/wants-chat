/**
 * Office Equipment Rental App Type Definition
 *
 * Complete definition for office equipment and technology rental.
 * Essential for office equipment rentals, copier leasing, and business technology.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'office-equipment-rental',
  name: 'Office Equipment Rental',
  category: 'rental',
  description: 'Office equipment platform with lease management, service scheduling, meter billing, and business accounts',
  icon: 'printer',

  keywords: [
    'office equipment',
    'copier rental',
    'office equipment software',
    'business technology',
    'printer lease',
    'office equipment management',
    'lease management',
    'office equipment practice',
    'office equipment scheduling',
    'service scheduling',
    'office equipment crm',
    'mfp leasing',
    'office equipment business',
    'computer rental',
    'office equipment pos',
    'telecom equipment',
    'office equipment operations',
    'managed print',
    'office equipment platform',
    'conference technology',
  ],

  synonyms: [
    'office equipment platform',
    'office equipment software',
    'copier rental software',
    'business technology software',
    'printer lease software',
    'lease management software',
    'office equipment practice software',
    'service scheduling software',
    'mfp leasing software',
    'managed print software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and service' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Leases and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/leases' },
    { id: 'technician', name: 'Service Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Business Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an office equipment rental platform',
    'Create a copier leasing portal',
    'I need a business technology rental system',
    'Build a managed print service platform',
    'Create a lease and service management app',
  ],
};
