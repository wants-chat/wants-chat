/**
 * Boat Dealer App Type Definition
 *
 * Complete definition for boat dealership and marine sales applications.
 * Essential for boat dealers, yacht brokers, and marine businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'boat-dealer',
  name: 'Boat Dealer',
  category: 'automotive',
  description: 'Boat dealership platform with inventory, marine financing, service, and customer management',
  icon: 'anchor',

  keywords: [
    'boat dealer',
    'boat dealership',
    'marine dealer',
    'boat sales',
    'boat software',
    'yacht broker',
    'boat inventory',
    'marine financing',
    'boat service',
    'boat business',
    'boat crm',
    'marine sales',
    'boat parts',
    'boat trade-in',
    'boat consignment',
    'watercraft dealer',
    'jet ski dealer',
    'boat management',
    'marine dealership',
    'boat showroom',
  ],

  synonyms: [
    'boat dealer platform',
    'boat dealer software',
    'boat dealership software',
    'marine dealer software',
    'boat sales software',
    'yacht broker software',
    'boat inventory software',
    'marine sales software',
    'boat crm software',
    'boat management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'boat rental marina'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and service' },
    { id: 'admin', name: 'Boat Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'salesperson', layout: 'admin', description: 'Sales and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'salesperson', name: 'Salesperson', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'technician', name: 'Marine Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a boat dealership platform',
    'Create a marine sales app',
    'I need a boat inventory system',
    'Build a yacht broker app',
    'Create a boat dealer CRM',
  ],
};
