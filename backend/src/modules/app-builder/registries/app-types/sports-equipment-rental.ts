/**
 * Sports Equipment Rental App Type Definition
 *
 * Complete definition for sports and recreation equipment rental.
 * Essential for sports rentals, outdoor equipment, and recreation services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'sports-equipment-rental',
  name: 'Sports Equipment Rental',
  category: 'rental',
  description: 'Sports equipment platform with online booking, size matching, seasonal inventory, and group reservations',
  icon: 'dumbbell',

  keywords: [
    'sports equipment',
    'recreation rental',
    'sports equipment software',
    'outdoor gear',
    'ski rental',
    'sports equipment management',
    'online booking',
    'sports equipment practice',
    'sports equipment scheduling',
    'size matching',
    'sports equipment crm',
    'bike rental',
    'sports equipment business',
    'water sports',
    'sports equipment pos',
    'camping gear',
    'sports equipment operations',
    'winter sports',
    'sports equipment platform',
    'adventure gear',
  ],

  synonyms: [
    'sports equipment platform',
    'sports equipment software',
    'recreation rental software',
    'outdoor gear software',
    'ski rental software',
    'online booking software',
    'sports equipment practice software',
    'size matching software',
    'bike rental software',
    'adventure gear software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rentals' },
    { id: 'staff', name: 'Rental Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkout' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a sports equipment rental platform',
    'Create a ski rental portal',
    'I need an outdoor gear rental system',
    'Build a recreation equipment rental platform',
    'Create an equipment booking and sizing app',
  ],
};
