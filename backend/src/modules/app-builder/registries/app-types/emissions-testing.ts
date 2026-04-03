/**
 * Emissions Testing App Type Definition
 *
 * Complete definition for emissions and smog testing stations.
 * Essential for smog check stations, emissions testing, and inspection facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMISSIONS_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'emissions-testing',
  name: 'Emissions Testing',
  category: 'automotive',
  description: 'Emissions testing platform with state compliance, VIN verification, test result tracking, and certificate printing',
  icon: 'gauge',

  keywords: [
    'emissions testing',
    'smog check',
    'emissions software',
    'vehicle inspection',
    'emissions station',
    'emissions management',
    'smog test',
    'emissions center',
    'emissions scheduling',
    'OBD testing',
    'emissions crm',
    'catalytic test',
    'emissions business',
    'tailpipe test',
    'emissions pos',
    'state inspection',
    'emissions operations',
    'emissions certificate',
    'emissions services',
    'clean air',
  ],

  synonyms: [
    'emissions testing platform',
    'emissions testing software',
    'smog check software',
    'vehicle inspection software',
    'emissions station software',
    'smog test software',
    'emissions center software',
    'OBD testing software',
    'state inspection software',
    'clean air testing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general auto'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Schedule and results' },
    { id: 'admin', name: 'Station Dashboard', enabled: true, basePath: '/admin', requiredRole: 'inspector', layout: 'admin', description: 'Tests and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Station Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Station Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tests' },
    { id: 'inspector', name: 'Inspector', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'vehicle-history',
    'recalls-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an emissions testing station platform',
    'Create a smog check scheduling app',
    'I need a vehicle inspection management system',
    'Build an emissions compliance platform',
    'Create a state inspection station app',
  ],
};
