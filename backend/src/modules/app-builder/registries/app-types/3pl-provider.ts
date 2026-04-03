/**
 * 3PL Provider App Type Definition
 *
 * Complete definition for third-party logistics provider applications.
 * Essential for 3PL companies, fulfillment providers, and logistics service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THREE_PL_PROVIDER_APP_TYPE: AppTypeDefinition = {
  id: '3pl-provider',
  name: '3PL Provider',
  category: 'logistics',
  description: '3PL platform with multi-client warehousing, order fulfillment, inventory management, and billing',
  icon: 'building',

  keywords: [
    '3pl',
    'third party logistics',
    '3pl provider',
    'fulfillment services',
    'logistics provider',
    '3pl software',
    'fulfillment center',
    'contract logistics',
    'logistics outsourcing',
    '3pl warehouse',
    'multi-client warehouse',
    'fulfillment provider',
    '3pl management',
    'logistics services',
    'ecommerce fulfillment',
    'order fulfillment',
    '3pl billing',
    '3pl operations',
    'fulfillment software',
    'logistics platform',
  ],

  synonyms: [
    '3pl platform',
    '3pl provider software',
    'third party logistics software',
    'fulfillment services platform',
    '3pl management software',
    'contract logistics software',
    'multi-client warehouse software',
    '3pl billing software',
    'fulfillment provider platform',
    'logistics service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'personal logistics'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and orders' },
    { id: 'admin', name: '3PL Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and billing' },
  ],

  roles: [
    { id: 'admin', name: '3PL Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'supervisor', name: 'Warehouse Supervisor', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'billing', name: 'Billing Specialist', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/billing' },
    { id: 'operator', name: 'Warehouse Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'payments',
    'dashboard',
    'notifications',
    'search',
    'warehouse-mgmt',
    'shipment-tracking',
    'carrier-integration',
  ],

  optionalFeatures: [
    'analytics',
    'route-optimization',
    'freight-quotes',
    'proof-of-delivery',
    'customs-docs',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a 3PL provider platform',
    'Create a fulfillment services app',
    'I need a third-party logistics system',
    'Build a multi-client warehouse platform',
    'Create a 3PL billing system',
  ],
};
