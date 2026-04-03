/**
 * Florist & Flower Shop App Type Definition
 *
 * Complete definition for florist and flower delivery applications.
 * Essential for florists, flower shops, and floral designers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLORIST_APP_TYPE: AppTypeDefinition = {
  id: 'florist',
  name: 'Florist & Flower Shop',
  category: 'ecommerce',
  description: 'Florist platform with arrangement ordering, delivery scheduling, and event florals',
  icon: 'seedling',

  keywords: [
    'florist',
    'flower shop',
    'flower delivery',
    'floral design',
    'bouquet',
    'ftd',
    'teleflora',
    '1800flowers',
    'bloomnation',
    'wedding flowers',
    'event florals',
    'funeral flowers',
    'flower arrangements',
    'roses',
    'plants',
    'flower subscription',
    'same day delivery',
    'floral gifts',
    'sympathy flowers',
    'birthday flowers',
    'anniversary flowers',
    'florist software',
  ],

  synonyms: [
    'florist platform',
    'flower shop software',
    'flower delivery app',
    'floral shop app',
    'flower ordering system',
    'florist ecommerce',
    'flower store app',
    'floral delivery platform',
    'flower business software',
    'florist booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Store', enabled: true, basePath: '/', layout: 'public', description: 'Browse and order flowers' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Order and inventory management' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'designer', name: 'Floral Designer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/designs' },
    { id: 'driver', name: 'Delivery Driver', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'shopping-cart',
    'checkout',
    'orders',
    'appointments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a florist ecommerce platform',
    'Create a flower delivery app',
    'I need a flower shop ordering system',
    'Build a floral design business app',
    'Create a florist app like 1-800-Flowers',
  ],
};
