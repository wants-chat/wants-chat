/**
 * RV Dealer App Type Definition
 *
 * Complete definition for RV and camper dealership applications.
 * Essential for RV dealers, camper sales, and recreational vehicle businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'rv-dealer',
  name: 'RV Dealer',
  category: 'automotive',
  description: 'RV dealership platform with inventory, financing, service scheduling, and customer management',
  icon: 'caravan',

  keywords: [
    'rv dealer',
    'rv dealership',
    'camper dealer',
    'rv sales',
    'rv software',
    'recreational vehicle',
    'rv inventory',
    'rv financing',
    'rv service',
    'motorhome dealer',
    'travel trailer',
    'rv business',
    'rv crm',
    'rv parts',
    'rv trade-in',
    'rv consignment',
    'rv rental',
    'camper sales',
    'rv management',
    'rv showroom',
  ],

  synonyms: [
    'rv dealer platform',
    'rv dealer software',
    'rv dealership software',
    'camper dealer software',
    'rv sales software',
    'rv inventory software',
    'recreational vehicle software',
    'rv service software',
    'rv crm software',
    'rv management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'rv park campground'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and service' },
    { id: 'admin', name: 'RV Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'salesperson', layout: 'admin', description: 'Sales and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'salesperson', name: 'Salesperson', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'technician', name: 'Service Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
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
    'appointments',
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an RV dealership platform',
    'Create a camper sales app',
    'I need an RV inventory system',
    'Build an RV service scheduling app',
    'Create an RV dealer CRM',
  ],
};
