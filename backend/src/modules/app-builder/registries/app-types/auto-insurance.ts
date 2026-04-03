/**
 * Auto Insurance App Type Definition
 *
 * Complete definition for auto insurance agencies.
 * Essential for car insurance agents, multi-line agencies, and vehicle coverage.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'auto-insurance',
  name: 'Auto Insurance',
  category: 'insurance',
  description: 'Auto insurance platform with quote comparison, vehicle tracking, claims filing, and multi-driver management',
  icon: 'car',

  keywords: [
    'auto insurance',
    'car insurance',
    'auto insurance software',
    'vehicle insurance',
    'auto coverage',
    'auto insurance management',
    'liability',
    'auto insurance agency',
    'auto insurance scheduling',
    'collision',
    'auto insurance crm',
    'comprehensive',
    'auto insurance business',
    'SR-22',
    'auto insurance pos',
    'multi-car',
    'auto insurance operations',
    'claims',
    'auto insurance services',
    'driver discount',
  ],

  synonyms: [
    'auto insurance platform',
    'auto insurance software',
    'car insurance software',
    'vehicle insurance software',
    'auto coverage software',
    'liability software',
    'auto insurance agency software',
    'collision software',
    'comprehensive software',
    'multi-car software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'auto repair'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and claims' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Quotes and policies' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/policies' },
    { id: 'agent', name: 'Insurance Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'insurance',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an auto insurance agency platform',
    'Create a car insurance quoting app',
    'I need a vehicle insurance management system',
    'Build a multi-line insurance agency platform',
    'Create an auto policy tracking app',
  ],
};
