/**
 * Countertop Fabricator App Type Definition
 *
 * Complete definition for countertop fabrication operations.
 * Essential for countertop fabricators, granite installers, and stone specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COUNTERTOP_FABRICATOR_APP_TYPE: AppTypeDefinition = {
  id: 'countertop-fabricator',
  name: 'Countertop Fabricator',
  category: 'construction',
  description: 'Countertop fabricator platform with template scheduling, material inventory, installation coordination, and remnant tracking',
  icon: 'square',

  keywords: [
    'countertop fabricator',
    'granite installer',
    'countertop fabricator software',
    'stone specialist',
    'quartz fabricator',
    'countertop fabricator management',
    'template scheduling',
    'countertop fabricator practice',
    'countertop fabricator scheduling',
    'material inventory',
    'countertop fabricator crm',
    'installation coordination',
    'countertop fabricator business',
    'remnant tracking',
    'countertop fabricator pos',
    'marble',
    'countertop fabricator operations',
    'edge profiles',
    'countertop fabricator platform',
    'slab selection',
  ],

  synonyms: [
    'countertop fabricator platform',
    'countertop fabricator software',
    'granite installer software',
    'stone specialist software',
    'quartz fabricator software',
    'template scheduling software',
    'countertop fabricator practice software',
    'material inventory software',
    'installation coordination software',
    'marble software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Selections and quotes' },
    { id: 'admin', name: 'Fabricator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'fabricator', name: 'Fabricator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a countertop fabricator platform',
    'Create a granite installation app',
    'I need a stone fabrication system',
    'Build a quartz countertop business app',
    'Create a countertop shop portal',
  ],
};
