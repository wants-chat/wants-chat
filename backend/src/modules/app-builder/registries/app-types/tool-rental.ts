/**
 * Tool Rental App Type Definition
 *
 * Complete definition for tool rental shops and hardware lending.
 * Essential for tool libraries, hardware rentals, and DIY equipment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOOL_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'tool-rental',
  name: 'Tool Rental',
  category: 'rental',
  description: 'Tool rental platform with tool catalog, reservation system, maintenance logs, and customer accounts',
  icon: 'hammer',

  keywords: [
    'tool rental',
    'hardware rental',
    'tool rental software',
    'tool library',
    'diy equipment',
    'tool rental management',
    'tool catalog',
    'tool rental practice',
    'tool rental scheduling',
    'reservation system',
    'tool rental crm',
    'power tools',
    'tool rental business',
    'hand tools',
    'tool rental pos',
    'specialty tools',
    'tool rental operations',
    'contractor tools',
    'tool rental platform',
    'landscaping tools',
  ],

  synonyms: [
    'tool rental platform',
    'tool rental software',
    'hardware rental software',
    'tool library software',
    'diy equipment software',
    'tool catalog software',
    'tool rental practice software',
    'reservation system software',
    'power tools software',
    'contractor tools software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tools and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rentals' },
    { id: 'staff', name: 'Rental Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkout' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a tool rental platform',
    'Create a hardware rental portal',
    'I need a tool library management system',
    'Build a DIY equipment rental platform',
    'Create a tool catalog and reservation app',
  ],
};
