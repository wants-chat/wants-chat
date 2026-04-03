/**
 * Chocolate Shop App Type Definition
 *
 * Complete definition for chocolate shops and confectioneries.
 * Essential for chocolatiers, candy makers, and specialty confection stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHOCOLATE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'chocolate-shop',
  name: 'Chocolate Shop',
  category: 'food-production',
  description: 'Chocolate shop platform with product showcasing, gift box customization, corporate gifting, and seasonal collections',
  icon: 'candy',

  keywords: [
    'chocolate shop',
    'chocolatier',
    'chocolate shop software',
    'confectionery',
    'candy shop',
    'chocolate shop management',
    'truffles',
    'chocolate shop practice',
    'chocolate shop scheduling',
    'gift boxes',
    'chocolate shop crm',
    'corporate gifts',
    'chocolate shop business',
    'seasonal chocolates',
    'chocolate shop pos',
    'bonbons',
    'chocolate shop operations',
    'pralines',
    'chocolate shop services',
    'artisan chocolate',
  ],

  synonyms: [
    'chocolate shop platform',
    'chocolate shop software',
    'chocolatier software',
    'confectionery software',
    'candy shop software',
    'truffles software',
    'chocolate shop practice software',
    'gift boxes software',
    'corporate gifts software',
    'artisan chocolate software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and gifts' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Products and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chocolatier', name: 'Chocolatier', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/products' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a chocolate shop platform',
    'Create a chocolatier store portal',
    'I need a confectionery management system',
    'Build a chocolate gift shop platform',
    'Create a corporate chocolate gifting app',
  ],
};
