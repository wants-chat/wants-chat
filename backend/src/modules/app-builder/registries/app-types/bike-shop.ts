/**
 * Bike Shop App Type Definition
 *
 * Complete definition for bicycle shop operations.
 * Essential for bike shops, cycling retailers, and bicycle service centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BIKE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'bike-shop',
  name: 'Bike Shop',
  category: 'retail',
  description: 'Bike shop platform with inventory management, service ticketing, bike fitting, and customer profiles',
  icon: 'bike',

  keywords: [
    'bike shop',
    'cycling retailer',
    'bike shop software',
    'bicycle service',
    'bike repair',
    'bike shop management',
    'inventory management',
    'bike shop practice',
    'bike shop scheduling',
    'service ticketing',
    'bike shop crm',
    'bike fitting',
    'bike shop business',
    'customer profiles',
    'bike shop pos',
    'ebike sales',
    'bike shop operations',
    'tune ups',
    'bike shop platform',
    'wheel building',
  ],

  synonyms: [
    'bike shop platform',
    'bike shop software',
    'cycling retailer software',
    'bicycle service software',
    'bike repair software',
    'inventory management software',
    'bike shop practice software',
    'service ticketing software',
    'bike fitting software',
    'ebike sales software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Shop and service' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and repairs' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'mechanic', name: 'Bike Mechanic', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Cyclist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a bike shop platform',
    'Create a cycling retailer app',
    'I need a bicycle shop system',
    'Build a bike service center app',
    'Create a bike shop portal',
  ],
};
