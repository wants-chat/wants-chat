/**
 * Pet Insurance App Type Definition
 *
 * Complete definition for pet insurance agencies.
 * Essential for pet insurance agents, veterinary coverage, and animal health plans.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'pet-insurance',
  name: 'Pet Insurance',
  category: 'insurance',
  description: 'Pet insurance platform with plan comparison, pet profiles, claims submission, and veterinary integration',
  icon: 'paw-print',

  keywords: [
    'pet insurance',
    'pet health',
    'pet insurance software',
    'dog insurance',
    'cat insurance',
    'pet insurance management',
    'veterinary coverage',
    'pet insurance agency',
    'pet insurance scheduling',
    'wellness plans',
    'pet insurance crm',
    'accident coverage',
    'pet insurance business',
    'illness coverage',
    'pet insurance pos',
    'hereditary conditions',
    'pet insurance operations',
    'deductibles',
    'pet insurance services',
    'reimbursement',
  ],

  synonyms: [
    'pet insurance platform',
    'pet insurance software',
    'pet health software',
    'dog insurance software',
    'cat insurance software',
    'veterinary coverage software',
    'pet insurance agency software',
    'wellness plans software',
    'accident coverage software',
    'illness coverage software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'veterinary clinic'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Plans and claims' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Pets and policies' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/policies' },
    { id: 'agent', name: 'Pet Insurance Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet insurance agency platform',
    'Create a pet health coverage app',
    'I need a veterinary insurance system',
    'Build a pet claims submission platform',
    'Create a dog and cat insurance app',
  ],
};
