/**
 * Appliance Store App Type Definition
 *
 * Complete definition for appliance retail and service operations.
 * Essential for appliance stores, home appliance retailers, and electronics dealers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPLIANCE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'appliance-store',
  name: 'Appliance Store',
  category: 'retail',
  description: 'Appliance store platform with product catalog, delivery scheduling, installation services, and financing options',
  icon: 'refrigerator',

  keywords: [
    'appliance store',
    'home appliances',
    'appliance store software',
    'electronics dealer',
    'major appliances',
    'appliance store management',
    'product catalog',
    'appliance store practice',
    'appliance store scheduling',
    'delivery scheduling',
    'appliance store crm',
    'installation services',
    'appliance store business',
    'financing options',
    'appliance store pos',
    'kitchen appliances',
    'appliance store operations',
    'laundry appliances',
    'appliance store platform',
    'extended warranty',
  ],

  synonyms: [
    'appliance store platform',
    'appliance store software',
    'home appliances software',
    'electronics dealer software',
    'major appliances software',
    'product catalog software',
    'appliance store practice software',
    'delivery scheduling software',
    'installation services software',
    'extended warranty software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sales', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'appointments',
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

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an appliance store platform',
    'Create a home appliance portal',
    'I need an appliance retail system',
    'Build a delivery scheduling platform',
    'Create an appliance financing app',
  ],
};
