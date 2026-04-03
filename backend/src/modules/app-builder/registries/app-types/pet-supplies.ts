/**
 * Pet Supplies App Type Definition
 *
 * Complete definition for pet supply store operations.
 * Essential for pet stores, pet food retailers, and animal supply shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_SUPPLIES_APP_TYPE: AppTypeDefinition = {
  id: 'pet-supplies',
  name: 'Pet Supplies',
  category: 'retail',
  description: 'Pet supplies platform with product inventory, subscription services, pet profiles, and loyalty programs',
  icon: 'bone',

  keywords: [
    'pet supplies',
    'pet store',
    'pet supplies software',
    'pet food',
    'animal supplies',
    'pet supplies management',
    'product inventory',
    'pet supplies practice',
    'pet supplies scheduling',
    'subscription services',
    'pet supplies crm',
    'pet profiles',
    'pet supplies business',
    'loyalty programs',
    'pet supplies pos',
    'pet accessories',
    'pet supplies operations',
    'autoship',
    'pet supplies platform',
    'species-specific',
  ],

  synonyms: [
    'pet supplies platform',
    'pet supplies software',
    'pet store software',
    'pet food software',
    'animal supplies software',
    'product inventory software',
    'pet supplies practice software',
    'subscription services software',
    'pet profiles software',
    'autoship software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and subscriptions' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet supplies platform',
    'Create a pet store portal',
    'I need a pet supplies management system',
    'Build a subscription and autoship platform',
    'Create an inventory and loyalty app',
  ],
};
