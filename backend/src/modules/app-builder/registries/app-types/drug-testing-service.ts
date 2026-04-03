/**
 * Drug Testing Service App Type Definition
 *
 * Complete definition for drug testing service operations.
 * Essential for drug testing labs, workplace testing services, and collection sites.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRUG_TESTING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'drug-testing-service',
  name: 'Drug Testing Service',
  category: 'healthcare',
  description: 'Drug testing platform with collection scheduling, chain of custody, result reporting, and compliance management',
  icon: 'test-tube',

  keywords: [
    'drug testing service',
    'drug testing lab',
    'drug testing service software',
    'workplace testing',
    'collection site',
    'drug testing service management',
    'collection scheduling',
    'drug testing service practice',
    'drug testing service scheduling',
    'chain of custody',
    'drug testing service crm',
    'result reporting',
    'drug testing service business',
    'compliance management',
    'drug testing service pos',
    'dot testing',
    'drug testing service operations',
    'pre-employment testing',
    'drug testing service platform',
    'random testing',
  ],

  synonyms: [
    'drug testing service platform',
    'drug testing service software',
    'drug testing lab software',
    'workplace testing software',
    'collection site software',
    'collection scheduling software',
    'drug testing service practice software',
    'chain of custody software',
    'result reporting software',
    'dot testing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Employer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Testing and results' },
    { id: 'admin', name: 'Testing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Collections and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/collections' },
    { id: 'collector', name: 'Collection Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'employer', name: 'Employer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a drug testing service platform',
    'Create a workplace drug testing app',
    'I need a drug testing lab system',
    'Build a collection site management app',
    'Create a drug testing service portal',
  ],
};
