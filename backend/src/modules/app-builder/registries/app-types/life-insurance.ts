/**
 * Life Insurance App Type Definition
 *
 * Complete definition for life insurance agents and agencies.
 * Essential for life insurance sales, annuities, and financial planning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIFE_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'life-insurance',
  name: 'Life Insurance',
  category: 'insurance',
  description: 'Life insurance platform with needs analysis, policy illustration, underwriting tracking, and beneficiary management',
  icon: 'shield-check',

  keywords: [
    'life insurance',
    'life agent',
    'life insurance software',
    'term life',
    'whole life',
    'life insurance management',
    'annuities',
    'life insurance agency',
    'life insurance scheduling',
    'universal life',
    'life insurance crm',
    'final expense',
    'life insurance business',
    'indexed universal',
    'life insurance pos',
    'burial insurance',
    'life insurance operations',
    'underwriting',
    'life insurance services',
    'death benefit',
  ],

  synonyms: [
    'life insurance platform',
    'life insurance software',
    'life agent software',
    'term life software',
    'whole life software',
    'annuities software',
    'life insurance agency software',
    'final expense software',
    'underwriting software',
    'death benefit software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'health insurance'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and quotes' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Clients and applications' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'agent', name: 'Life Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clients' },
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
  complexity: 'complex',
  industry: 'insurance',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a life insurance agency platform',
    'Create a policy illustration app',
    'I need a life insurance underwriting system',
    'Build a final expense sales platform',
    'Create a life insurance client management app',
  ],
};
