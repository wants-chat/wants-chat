/**
 * Spice Shop App Type Definition
 *
 * Complete definition for spice shops and herb retailers.
 * Essential for spice merchants, herb stores, and seasoning specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPICE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'spice-shop',
  name: 'Spice Shop',
  category: 'food-production',
  description: 'Spice shop platform with spice catalog, custom blends, recipe suggestions, and freshness tracking',
  icon: 'leaf',

  keywords: [
    'spice shop',
    'herb store',
    'spice shop software',
    'spice merchant',
    'seasonings',
    'spice shop management',
    'custom blends',
    'spice shop practice',
    'spice shop scheduling',
    'dried herbs',
    'spice shop crm',
    'exotic spices',
    'spice shop business',
    'spice rubs',
    'spice shop pos',
    'curry blends',
    'spice shop operations',
    'grinding service',
    'spice shop services',
    'culinary spices',
  ],

  synonyms: [
    'spice shop platform',
    'spice shop software',
    'herb store software',
    'spice merchant software',
    'seasonings software',
    'custom blends software',
    'spice shop practice software',
    'dried herbs software',
    'exotic spices software',
    'culinary spices software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Spices and recipes' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Products and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'blender', name: 'Spice Blender', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/blends' },
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

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a spice shop platform',
    'Create a herb store ordering portal',
    'I need a spice merchant management system',
    'Build a spice shop business platform',
    'Create a custom spice blends app',
  ],
};
