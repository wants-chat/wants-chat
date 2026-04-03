/**
 * Wholesale App Type Definition
 *
 * Complete definition for wholesale and B2B commerce applications.
 * Essential for wholesalers, distributors, and B2B marketplaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale',
  name: 'Wholesale',
  category: 'ecommerce',
  description: 'Wholesale platform with B2B pricing, bulk ordering, retailer management, and trade accounts',
  icon: 'warehouse',

  keywords: [
    'wholesale',
    'b2b',
    'business to business',
    'bulk ordering',
    'trade',
    'distributor',
    'wholesale marketplace',
    'wholesale portal',
    'faire',
    'alibaba',
    'bulk pricing',
    'trade accounts',
    'retailer portal',
    'wholesale catalog',
    'minimum order',
    'volume discount',
    'wholesale supplier',
    'wholesale buyer',
    'trade show',
    'wholesale network',
    'distribution',
  ],

  synonyms: [
    'wholesale platform',
    'wholesale software',
    'b2b ecommerce platform',
    'wholesale marketplace',
    'distributor software',
    'wholesale portal',
    'b2b ordering system',
    'wholesale management',
    'trade portal',
    'wholesale ordering app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Buyer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and order products' },
    { id: 'admin', name: 'Supplier Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supplier', layout: 'admin', description: 'Products and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supplier', name: 'Supplier/Vendor', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/products' },
    { id: 'sales', name: 'Sales Rep', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/accounts' },
    { id: 'warehouse', name: 'Warehouse Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'retailer', name: 'Retailer/Buyer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'booking-system'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'ecommerce',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a wholesale B2B platform',
    'Create a wholesale marketplace like Faire',
    'I need a distributor ordering system',
    'Build a trade portal for retailers',
    'Create a bulk ordering platform',
  ],
};
