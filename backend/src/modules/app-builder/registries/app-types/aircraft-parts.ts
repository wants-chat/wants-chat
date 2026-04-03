/**
 * Aircraft Parts App Type Definition
 *
 * Complete definition for aircraft parts suppliers and distributors.
 * Essential for parts dealers, component suppliers, and aviation parts distributors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRCRAFT_PARTS_APP_TYPE: AppTypeDefinition = {
  id: 'aircraft-parts',
  name: 'Aircraft Parts Supplier',
  category: 'aviation',
  description: 'Aircraft parts platform with inventory management, parts search, traceability, and order fulfillment',
  icon: 'cog',

  keywords: [
    'aircraft parts',
    'aviation parts',
    'aircraft parts software',
    'component supplier',
    'avionics parts',
    'aircraft parts management',
    'inventory management',
    'aircraft parts practice',
    'aircraft parts scheduling',
    'parts search',
    'aircraft parts crm',
    'rotable parts',
    'aircraft parts business',
    'consumables',
    'aircraft parts pos',
    'pma parts',
    'aircraft parts operations',
    'oem parts',
    'aircraft parts services',
    'expendables',
  ],

  synonyms: [
    'aircraft parts platform',
    'aircraft parts software',
    'aviation parts software',
    'component supplier software',
    'avionics parts software',
    'inventory management software',
    'aircraft parts practice software',
    'parts search software',
    'rotable parts software',
    'oem parts software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Parts and orders' },
    { id: 'admin', name: 'Supplier Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and fulfillment' },
  ],

  roles: [
    { id: 'admin', name: 'Operations Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Inventory Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sales', name: 'Sales Rep', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'shipping',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an aircraft parts supplier platform',
    'Create an aviation parts portal',
    'I need a component supplier management system',
    'Build a parts inventory platform',
    'Create a parts search and ordering app',
  ],
};
