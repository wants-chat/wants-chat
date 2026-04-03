/**
 * Craft Supply App Type Definition
 *
 * Complete definition for craft supply store operations.
 * Essential for craft stores, art supply shops, and maker spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRAFT_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'craft-supply',
  name: 'Craft Supply',
  category: 'retail',
  description: 'Craft supply platform with product inventory, class scheduling, project tutorials, and bulk ordering',
  icon: 'scissors',

  keywords: [
    'craft supply',
    'art supply',
    'craft supply software',
    'craft store',
    'maker space',
    'craft supply management',
    'product inventory',
    'craft supply practice',
    'craft supply scheduling',
    'class scheduling',
    'craft supply crm',
    'project tutorials',
    'craft supply business',
    'bulk ordering',
    'craft supply pos',
    'diy supplies',
    'craft supply operations',
    'workshop materials',
    'craft supply platform',
    'crafting community',
  ],

  synonyms: [
    'craft supply platform',
    'craft supply software',
    'art supply software',
    'craft store software',
    'maker space software',
    'product inventory software',
    'craft supply practice software',
    'class scheduling software',
    'project tutorials software',
    'crafting community software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Supplies and classes' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and classes' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'instructor', name: 'Class Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'customer', name: 'Crafter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a craft supply store platform',
    'Create an art supply shop portal',
    'I need a craft store management system',
    'Build a class scheduling platform',
    'Create an inventory and tutorials app',
  ],
};
