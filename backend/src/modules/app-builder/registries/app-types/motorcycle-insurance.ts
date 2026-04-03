/**
 * Motorcycle Insurance App Type Definition
 *
 * Complete definition for motorcycle and specialty vehicle insurance.
 * Essential for motorcycle agents, powersports coverage, and recreational vehicles.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOTORCYCLE_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'motorcycle-insurance',
  name: 'Motorcycle Insurance',
  category: 'insurance',
  description: 'Motorcycle insurance platform with specialty vehicle quoting, seasonal policies, custom parts coverage, and club discounts',
  icon: 'bike',

  keywords: [
    'motorcycle insurance',
    'bike insurance',
    'motorcycle insurance software',
    'powersports',
    'motorcycle coverage',
    'motorcycle insurance management',
    'ATV insurance',
    'motorcycle insurance agency',
    'motorcycle insurance scheduling',
    'custom parts',
    'motorcycle insurance crm',
    'accessories coverage',
    'motorcycle insurance business',
    'snowmobile insurance',
    'motorcycle insurance pos',
    'seasonal policy',
    'motorcycle insurance operations',
    'rider training',
    'motorcycle insurance services',
    'trike insurance',
  ],

  synonyms: [
    'motorcycle insurance platform',
    'motorcycle insurance software',
    'bike insurance software',
    'powersports software',
    'motorcycle coverage software',
    'ATV insurance software',
    'motorcycle insurance agency software',
    'custom parts software',
    'snowmobile insurance software',
    'trike insurance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'auto repair'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and quotes' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Riders and vehicles' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/policies' },
    { id: 'agent', name: 'Specialty Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
    { id: 'rider', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a motorcycle insurance agency platform',
    'Create a powersports coverage app',
    'I need a specialty vehicle insurance system',
    'Build a custom parts coverage platform',
    'Create an ATV insurance app',
  ],
};
