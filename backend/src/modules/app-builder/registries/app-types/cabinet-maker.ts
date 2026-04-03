/**
 * Cabinet Maker App Type Definition
 *
 * Complete definition for cabinet making and installation operations.
 * Essential for cabinet makers, kitchen designers, and custom woodwork specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CABINET_MAKER_APP_TYPE: AppTypeDefinition = {
  id: 'cabinet-maker',
  name: 'Cabinet Maker',
  category: 'construction',
  description: 'Cabinet maker platform with design consultation, production scheduling, material management, and installation coordination',
  icon: 'cabinet',

  keywords: [
    'cabinet maker',
    'kitchen designer',
    'cabinet maker software',
    'custom woodwork',
    'cabinetry',
    'cabinet maker management',
    'design consultation',
    'cabinet maker practice',
    'cabinet maker scheduling',
    'production scheduling',
    'cabinet maker crm',
    'material management',
    'cabinet maker business',
    'installation coordination',
    'cabinet maker pos',
    'bathroom vanity',
    'cabinet maker operations',
    'closet systems',
    'cabinet maker platform',
    'built ins',
  ],

  synonyms: [
    'cabinet maker platform',
    'cabinet maker software',
    'kitchen designer software',
    'custom woodwork software',
    'cabinetry software',
    'design consultation software',
    'cabinet maker practice software',
    'production scheduling software',
    'material management software',
    'bathroom vanity software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Designs and orders' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Kitchen Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'craftsman', name: 'Cabinet Maker', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'craftsman',

  examplePrompts: [
    'Build a cabinet maker platform',
    'Create a kitchen cabinet design app',
    'I need a custom cabinetry system',
    'Build a cabinet shop management app',
    'Create a cabinet making business portal',
  ],
};
