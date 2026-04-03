/**
 * Motorcycle Dealer App Type Definition
 *
 * Complete definition for motorcycle dealership applications.
 * Essential for motorcycle dealers, powersports dealers, and bike shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOTORCYCLE_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'motorcycle-dealer',
  name: 'Motorcycle Dealer',
  category: 'automotive',
  description: 'Motorcycle dealership platform with inventory, parts, service scheduling, and customer management',
  icon: 'bike',

  keywords: [
    'motorcycle dealer',
    'motorcycle dealership',
    'powersports dealer',
    'motorcycle sales',
    'motorcycle software',
    'bike dealer',
    'motorcycle inventory',
    'motorcycle service',
    'motorcycle parts',
    'harley dealer',
    'atv dealer',
    'motorcycle shop',
    'motorcycle crm',
    'powersports sales',
    'motorcycle business',
    'motorcycle financing',
    'motorcycle trade-in',
    'motorcycle repair',
    'motorcycle management',
    'scooter dealer',
  ],

  synonyms: [
    'motorcycle dealer platform',
    'motorcycle dealer software',
    'powersports dealer software',
    'motorcycle dealership software',
    'motorcycle sales software',
    'bike dealer software',
    'motorcycle inventory software',
    'motorcycle service software',
    'powersports software',
    'motorcycle management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'bicycle'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and service' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'salesperson', layout: 'admin', description: 'Sales and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'salesperson', name: 'Salesperson', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'technician', name: 'Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'vehicle-inventory',
    'test-drives',
    'vehicle-financing',
    'trade-in-valuation',
    'vehicle-history',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'service-scheduling',
    'parts-catalog',
    'recalls-tracking',
    'reviews',
    'email',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a motorcycle dealership platform',
    'Create a powersports dealer app',
    'I need a motorcycle inventory system',
    'Build a motorcycle service scheduling app',
    'Create a motorcycle dealer CRM',
  ],
};
