/**
 * Specialty Food App Type Definition
 *
 * Complete definition for specialty food stores and gourmet shops.
 * Essential for gourmet retailers, imported food stores, and specialty grocers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-food',
  name: 'Specialty Food',
  category: 'food-production',
  description: 'Specialty food platform with curated products, origin stories, gift baskets, and tasting experiences',
  icon: 'utensils',

  keywords: [
    'specialty food',
    'gourmet shop',
    'specialty food software',
    'imported foods',
    'artisan products',
    'specialty food management',
    'curated selection',
    'specialty food practice',
    'specialty food scheduling',
    'gift baskets',
    'specialty food crm',
    'fine foods',
    'specialty food business',
    'international foods',
    'specialty food pos',
    'organic specialty',
    'specialty food operations',
    'gourmet gifts',
    'specialty food services',
    'food boutique',
  ],

  synonyms: [
    'specialty food platform',
    'specialty food software',
    'gourmet shop software',
    'imported foods software',
    'artisan products software',
    'curated selection software',
    'specialty food practice software',
    'gift baskets software',
    'fine foods software',
    'food boutique software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and gifts' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Products and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'buyer', name: 'Buyer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/products' },
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

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'boutique',

  examplePrompts: [
    'Build a specialty food store platform',
    'Create a gourmet shop ordering portal',
    'I need a specialty food management system',
    'Build a specialty food business platform',
    'Create a curated food and gift app',
  ],
};
