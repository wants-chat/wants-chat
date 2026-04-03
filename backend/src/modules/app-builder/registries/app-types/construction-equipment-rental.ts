/**
 * Construction Equipment Rental App Type Definition
 *
 * Complete definition for construction equipment and heavy machinery rental.
 * Essential for heavy equipment rental, construction rentals, and earthmoving.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONSTRUCTION_EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'construction-equipment-rental',
  name: 'Construction Equipment Rental',
  category: 'rental',
  description: 'Construction equipment platform with fleet management, operator certification, delivery logistics, and maintenance',
  icon: 'truck',

  keywords: [
    'construction equipment',
    'heavy equipment',
    'construction equipment software',
    'earthmoving rental',
    'machinery rental',
    'construction equipment management',
    'fleet management',
    'construction equipment practice',
    'construction equipment scheduling',
    'operator certification',
    'construction equipment crm',
    'excavators',
    'construction equipment business',
    'loaders dozers',
    'construction equipment pos',
    'scaffolding rental',
    'construction equipment operations',
    'cranes lifts',
    'construction equipment platform',
    'contractor rental',
  ],

  synonyms: [
    'construction equipment platform',
    'construction equipment software',
    'heavy equipment software',
    'earthmoving rental software',
    'machinery rental software',
    'fleet management software',
    'construction equipment practice software',
    'operator certification software',
    'excavators software',
    'contractor rental software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Contractor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Fleet Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/fleet' },
    { id: 'dispatch', name: 'Dispatch', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'contractor', name: 'Contractor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'daily-logs',
    'site-safety',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'rental',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a construction equipment rental platform',
    'Create a heavy equipment rental portal',
    'I need an earthmoving rental management system',
    'Build a machinery rental platform',
    'Create a fleet and delivery tracking app',
  ],
};
