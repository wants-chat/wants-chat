/**
 * Print on Demand App Type Definition
 *
 * Complete definition for print-on-demand and custom merchandise applications.
 * Essential for POD businesses, custom apparel, and personalized products.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_ON_DEMAND_APP_TYPE: AppTypeDefinition = {
  id: 'print-on-demand',
  name: 'Print on Demand',
  category: 'ecommerce',
  description: 'Print on demand platform with design tools, product mockups, fulfillment integration, and creator storefronts',
  icon: 'printer',

  keywords: [
    'print on demand',
    'pod',
    'printful',
    'printify',
    'teespring',
    'redbubble',
    'custom merchandise',
    'custom apparel',
    't-shirt printing',
    'merch',
    'custom products',
    'design upload',
    'product mockups',
    'fulfillment',
    'print to order',
    'custom printing',
    'personalized products',
    'creator merch',
    'on-demand printing',
    'white label products',
    'custom gifts',
  ],

  synonyms: [
    'print on demand platform',
    'pod software',
    'custom merchandise platform',
    'print on demand app',
    'merch platform',
    'custom apparel software',
    'pod fulfillment platform',
    'print on demand store',
    'custom product platform',
    'merchandise software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Store', enabled: true, basePath: '/', layout: 'public', description: 'Browse and buy products' },
    { id: 'admin', name: 'Creator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'creator', layout: 'admin', description: 'Designs and products' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'creator', name: 'Creator/Designer', level: 60, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/products' },
    { id: 'staff', name: 'Support Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'orders',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'settings',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'booking-system'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'ecommerce',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a print on demand platform',
    'Create a custom merchandise store',
    'I need a POD store like Printful',
    'Build a creator merch platform',
    'Create a custom t-shirt printing site',
  ],
};
