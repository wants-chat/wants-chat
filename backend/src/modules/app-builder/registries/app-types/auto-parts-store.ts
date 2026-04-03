/**
 * Auto Parts Store App Type Definition
 *
 * Complete definition for auto parts retail and distribution applications.
 * Essential for auto parts stores, parts distributors, and aftermarket retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_PARTS_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'auto-parts-store',
  name: 'Auto Parts Store',
  category: 'automotive',
  description: 'Auto parts store platform with catalog management, parts lookup, inventory, and e-commerce',
  icon: 'wrench',

  keywords: [
    'auto parts store',
    'auto parts',
    'car parts',
    'parts store software',
    'auto parts catalog',
    'parts lookup',
    'auto parts inventory',
    'aftermarket parts',
    'oem parts',
    'auto parts retail',
    'parts distribution',
    'auto parts business',
    'parts counter',
    'auto accessories',
    'parts ordering',
    'vehicle parts',
    'auto parts ecommerce',
    'parts warehouse',
    'auto parts pos',
    'parts management',
  ],

  synonyms: [
    'auto parts store platform',
    'auto parts store software',
    'auto parts software',
    'parts catalog software',
    'auto parts inventory software',
    'parts lookup software',
    'auto parts retail software',
    'parts distribution software',
    'auto parts pos software',
    'parts management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'body parts'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Parts and orders' },
    { id: 'admin', name: 'Parts Dashboard', enabled: true, basePath: '/admin', requiredRole: 'counter', layout: 'admin', description: 'Inventory and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'counter', name: 'Counter Staff', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
    { id: 'warehouse', name: 'Warehouse', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/stock' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'parts-catalog',
    'vehicle-inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'recalls-tracking',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an auto parts store platform',
    'Create a parts catalog app',
    'I need an auto parts inventory system',
    'Build a parts lookup app',
    'Create an auto parts e-commerce platform',
  ],
};
