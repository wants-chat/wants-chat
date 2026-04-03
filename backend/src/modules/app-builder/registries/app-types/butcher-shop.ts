/**
 * Butcher Shop App Type Definition
 *
 * Complete definition for butcher shops and meat markets.
 * Essential for craft butchers, meat shops, and specialty meat purveyors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUTCHER_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'butcher-shop',
  name: 'Butcher Shop',
  category: 'food-production',
  description: 'Butcher shop platform with meat inventory, custom cuts, pre-orders, and farm sourcing tracking',
  icon: 'beef',

  keywords: [
    'butcher shop',
    'meat market',
    'butcher shop software',
    'craft butcher',
    'meat shop',
    'butcher shop management',
    'custom cuts',
    'butcher shop practice',
    'butcher shop scheduling',
    'farm sourcing',
    'butcher shop crm',
    'specialty meats',
    'butcher shop business',
    'dry aging',
    'butcher shop pos',
    'charcuterie',
    'butcher shop operations',
    'wholesale meat',
    'butcher shop services',
    'artisan butcher',
  ],

  synonyms: [
    'butcher shop platform',
    'butcher shop software',
    'meat market software',
    'craft butcher software',
    'meat shop software',
    'custom cuts software',
    'butcher shop practice software',
    'farm sourcing software',
    'specialty meats software',
    'artisan butcher software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Butcher Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'butcher', name: 'Master Butcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'traditional',

  examplePrompts: [
    'Build a butcher shop platform',
    'Create a meat market ordering portal',
    'I need a craft butcher management system',
    'Build a butcher shop business platform',
    'Create a meat inventory and ordering app',
  ],
};
