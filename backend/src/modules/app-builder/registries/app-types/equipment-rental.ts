/**
 * Equipment Rental App Type Definition
 *
 * Complete definition for general equipment rental businesses.
 * Essential for equipment rental companies, rental centers, and hire services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'equipment-rental',
  name: 'Equipment Rental',
  category: 'rental',
  description: 'Equipment rental platform with inventory management, online reservations, maintenance tracking, and billing',
  icon: 'package',

  keywords: [
    'equipment rental',
    'rental business',
    'equipment rental software',
    'hire services',
    'rental center',
    'equipment rental management',
    'inventory management',
    'equipment rental practice',
    'equipment rental scheduling',
    'online reservations',
    'equipment rental crm',
    'rental rates',
    'equipment rental business',
    'maintenance tracking',
    'equipment rental pos',
    'rental contracts',
    'equipment rental operations',
    'delivery services',
    'equipment rental platform',
    'pickup return',
  ],

  synonyms: [
    'equipment rental platform',
    'equipment rental software',
    'rental business software',
    'hire services software',
    'rental center software',
    'inventory management software',
    'equipment rental practice software',
    'online reservations software',
    'rental rates software',
    'rental contracts software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Rental Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rentals' },
    { id: 'staff', name: 'Counter Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkout' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an equipment rental platform',
    'Create a rental business portal',
    'I need a hire services management system',
    'Build a rental center platform',
    'Create an inventory and reservation app',
  ],
};
