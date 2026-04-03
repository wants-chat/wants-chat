/**
 * Dropshipping App Type Definition
 *
 * Complete definition for dropshipping and fulfillment-free e-commerce applications.
 * Essential for dropshipping stores, print-on-demand, and supplier-fulfilled commerce.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DROPSHIPPING_APP_TYPE: AppTypeDefinition = {
  id: 'dropshipping',
  name: 'Dropshipping',
  category: 'ecommerce',
  description: 'Dropshipping platform with supplier integration, automated ordering, profit tracking, and storefront management',
  icon: 'truck',

  keywords: [
    'dropshipping',
    'dropship',
    'oberlo',
    'aliexpress dropship',
    'spocket',
    'supplier fulfillment',
    'no inventory',
    'fulfillment free',
    'product sourcing',
    'supplier integration',
    'automated fulfillment',
    'profit margin',
    'product import',
    'supplier sync',
    'ecommerce dropship',
    'shopify dropship',
    'order forwarding',
    'wholesale dropship',
    'supplier network',
    'dropship store',
    'arbitrage',
  ],

  synonyms: [
    'dropshipping platform',
    'dropshipping software',
    'dropship store builder',
    'supplier fulfillment software',
    'dropship management',
    'dropshipping app',
    'automated dropship',
    'supplier integration platform',
    'dropship ecommerce',
    'fulfillment automation',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Store', enabled: true, basePath: '/', layout: 'public', description: 'Customer shopping experience' },
    { id: 'admin', name: 'Seller Dashboard', enabled: true, basePath: '/admin', requiredRole: 'seller', layout: 'admin', description: 'Products and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'seller', name: 'Store Manager', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/products' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'shipment-tracking',
    'carrier-integration',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'orders',
    'analytics',
    'warehouse-mgmt',
    'freight-quotes',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'booking-system'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'ecommerce',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a dropshipping store platform',
    'Create an automated dropship business',
    'I need a dropshipping management system',
    'Build a supplier-fulfilled ecommerce store',
    'Create a dropship store like Oberlo',
  ],
};
