/**
 * Gift Shop App Type Definition
 *
 * Complete definition for gift shops and specialty gift retailers.
 * Essential for gift stores, souvenir shops, and specialty gift boutiques.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GIFT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'gift-shop',
  name: 'Gift Shop',
  category: 'retail',
  description: 'Gift shop platform with gift finder, custom wrapping, corporate gifting, and occasion-based categories',
  icon: 'gift',

  keywords: [
    'gift shop',
    'gift store',
    'gift shop software',
    'specialty gifts',
    'souvenir shop',
    'gift shop management',
    'gift wrapping',
    'gift shop practice',
    'gift shop scheduling',
    'corporate gifts',
    'gift shop crm',
    'occasion gifts',
    'gift shop business',
    'personalization',
    'gift shop pos',
    'gift baskets',
    'gift shop operations',
    'greeting cards',
    'gift shop services',
    'gift retail',
  ],

  synonyms: [
    'gift shop platform',
    'gift shop software',
    'gift store software',
    'specialty gifts software',
    'souvenir shop software',
    'gift wrapping software',
    'gift shop practice software',
    'corporate gifts software',
    'occasion gifts software',
    'gift retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Gifts and occasions' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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
  industry: 'retail',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'boutique',

  examplePrompts: [
    'Build a gift shop platform',
    'Create a specialty gift store portal',
    'I need a gift retail management system',
    'Build a gift shop business platform',
    'Create a gift finder and wrapping app',
  ],
};
