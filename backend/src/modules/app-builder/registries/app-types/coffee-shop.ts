/**
 * Coffee Shop App Type Definition
 *
 * Complete definition for coffee shop and cafe applications.
 * Essential for coffee shops, cafes, and specialty coffee roasters.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COFFEE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'coffee-shop',
  name: 'Coffee Shop',
  category: 'food-beverage',
  description: 'Coffee shop platform with menu management, mobile ordering, loyalty program, and pickup scheduling',
  icon: 'coffee',

  keywords: [
    'coffee shop',
    'cafe',
    'coffee house',
    'espresso bar',
    'coffee roaster',
    'specialty coffee',
    'coffee menu',
    'coffee ordering',
    'coffee loyalty',
    'barista',
    'coffee app',
    'latte',
    'cappuccino',
    'coffee subscription',
    'coffee beans',
    'pour over',
    'cold brew',
    'coffee drinks',
    'cafe menu',
    'coffee rewards',
  ],

  synonyms: [
    'coffee shop platform',
    'coffee shop software',
    'cafe management software',
    'coffee ordering app',
    'coffee shop pos',
    'cafe app',
    'coffee loyalty software',
    'specialty coffee software',
    'coffee roaster software',
    'coffee shop management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'programming coffee'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Order and earn rewards' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Orders and menu' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'barista', name: 'Barista', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'table-reservations',
    'kitchen-display',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a coffee shop app',
    'Create a cafe ordering platform',
    'I need a coffee loyalty program',
    'Build a specialty coffee shop app',
    'Create a mobile coffee ordering system',
  ],
};
