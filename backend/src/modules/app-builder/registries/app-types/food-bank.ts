/**
 * Food Bank App Type Definition
 *
 * Complete definition for food bank operations.
 * Essential for food banks, food pantries, and hunger relief organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_BANK_APP_TYPE: AppTypeDefinition = {
  id: 'food-bank',
  name: 'Food Bank',
  category: 'community',
  description: 'Food bank platform with inventory management, client intake, distribution scheduling, and donor tracking',
  icon: 'package',

  keywords: [
    'food bank',
    'food pantry',
    'food bank software',
    'hunger relief',
    'food distribution',
    'food bank management',
    'inventory management',
    'food bank practice',
    'food bank scheduling',
    'client intake',
    'food bank crm',
    'distribution scheduling',
    'food bank business',
    'donor tracking',
    'food bank pos',
    'food rescue',
    'food bank operations',
    'volunteer coordination',
    'food bank platform',
    'meal programs',
  ],

  synonyms: [
    'food bank platform',
    'food bank software',
    'food pantry software',
    'hunger relief software',
    'food distribution software',
    'inventory management software',
    'food bank practice software',
    'client intake software',
    'distribution scheduling software',
    'meal programs software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and locations' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Staff/Volunteer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/distribution' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'accessible',

  examplePrompts: [
    'Build a food bank management platform',
    'Create a food pantry portal',
    'I need a hunger relief distribution system',
    'Build a food inventory and client platform',
    'Create a donor and volunteer tracking app',
  ],
};
