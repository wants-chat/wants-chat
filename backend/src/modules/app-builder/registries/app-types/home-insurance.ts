/**
 * Home Insurance App Type Definition
 *
 * Complete definition for homeowners insurance agencies.
 * Essential for property insurance agents, dwelling coverage, and liability protection.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'home-insurance',
  name: 'Home Insurance',
  category: 'insurance',
  description: 'Home insurance platform with property valuation, coverage recommendations, claims management, and policy bundling',
  icon: 'home',

  keywords: [
    'home insurance',
    'homeowners insurance',
    'home insurance software',
    'property insurance',
    'dwelling coverage',
    'home insurance management',
    'renters insurance',
    'home insurance agency',
    'home insurance scheduling',
    'condo insurance',
    'home insurance crm',
    'flood insurance',
    'home insurance business',
    'liability',
    'home insurance pos',
    'replacement cost',
    'home insurance operations',
    'personal property',
    'home insurance services',
    'umbrella',
  ],

  synonyms: [
    'home insurance platform',
    'home insurance software',
    'homeowners insurance software',
    'property insurance software',
    'dwelling coverage software',
    'renters insurance software',
    'home insurance agency software',
    'condo insurance software',
    'flood insurance software',
    'umbrella insurance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home repair'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and claims' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Properties and policies' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/policies' },
    { id: 'agent', name: 'Property Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
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
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'car-rental'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'insurance',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a home insurance agency platform',
    'Create a homeowners policy quoting app',
    'I need a property insurance management system',
    'Build a renters insurance platform',
    'Create a dwelling coverage app',
  ],
};
