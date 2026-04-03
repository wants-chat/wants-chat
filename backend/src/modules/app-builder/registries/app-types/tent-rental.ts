/**
 * Tent Rental App Type Definition
 *
 * Complete definition for tent rental operations.
 * Essential for event tent companies, outdoor event rentals, and canopy services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'tent-rental',
  name: 'Tent Rental',
  category: 'rental',
  description: 'Tent rental platform with inventory management, setup scheduling, size calculator, and delivery coordination',
  icon: 'tent',

  keywords: [
    'tent rental',
    'event tent',
    'tent rental software',
    'outdoor event',
    'canopy rental',
    'tent rental management',
    'inventory management',
    'tent rental practice',
    'tent rental scheduling',
    'setup scheduling',
    'tent rental crm',
    'size calculator',
    'tent rental business',
    'delivery coordination',
    'tent rental pos',
    'party tent',
    'tent rental operations',
    'wedding tent',
    'tent rental platform',
    'pole tent',
  ],

  synonyms: [
    'tent rental platform',
    'tent rental software',
    'event tent software',
    'outdoor event software',
    'canopy rental software',
    'inventory management software',
    'tent rental practice software',
    'setup scheduling software',
    'size calculator software',
    'wedding tent software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rentals and quotes' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'crew', name: 'Setup Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build a tent rental platform',
    'Create an event tent rental portal',
    'I need a tent rental management system',
    'Build an inventory and scheduling platform',
    'Create a size calculator and delivery app',
  ],
};
