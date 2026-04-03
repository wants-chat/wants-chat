/**
 * Travel Insurance App Type Definition
 *
 * Complete definition for travel insurance provider applications.
 * Essential for travel insurance companies, brokers, and comparison platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'travel-insurance',
  name: 'Travel Insurance',
  category: 'travel',
  description: 'Travel insurance platform with policy sales, claims processing, quote comparison, and coverage management',
  icon: 'shield',

  keywords: [
    'travel insurance',
    'travel insurance software',
    'trip insurance',
    'travel coverage',
    'travel insurance quotes',
    'travel insurance claims',
    'travel insurance policy',
    'vacation insurance',
    'travel medical insurance',
    'trip cancellation insurance',
    'travel insurance provider',
    'travel insurance broker',
    'travel insurance comparison',
    'international travel insurance',
    'travel insurance business',
    'travel protection',
    'insurance portal',
    'emergency travel insurance',
    'annual travel insurance',
    'single trip insurance',
  ],

  synonyms: [
    'travel insurance platform',
    'travel insurance software',
    'trip insurance software',
    'travel coverage software',
    'travel insurance quote software',
    'travel insurance claims software',
    'travel insurance broker software',
    'travel protection software',
    'vacation insurance software',
    'travel medical insurance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'car insurance'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and policies' },
    { id: 'admin', name: 'Insurance Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Policies and claims' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/policies' },
    { id: 'claims', name: 'Claims Adjuster', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/claims' },
    { id: 'agent', name: 'Insurance Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a travel insurance platform',
    'Create a trip insurance quoting app',
    'I need a travel insurance claims system',
    'Build a travel insurance comparison app',
    'Create a travel coverage management platform',
  ],
};
