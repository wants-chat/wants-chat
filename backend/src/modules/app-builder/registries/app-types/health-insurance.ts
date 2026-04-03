/**
 * Health Insurance App Type Definition
 *
 * Complete definition for health insurance brokers and agencies.
 * Essential for health insurance agents, Medicare specialists, and benefits brokers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'health-insurance',
  name: 'Health Insurance',
  category: 'insurance',
  description: 'Health insurance platform with plan comparison, enrollment management, renewal tracking, and carrier integration',
  icon: 'heart-pulse',

  keywords: [
    'health insurance',
    'health broker',
    'health insurance software',
    'Medicare',
    'health plans',
    'health insurance management',
    'ACA insurance',
    'health insurance agency',
    'health insurance scheduling',
    'group health',
    'health insurance crm',
    'individual health',
    'health insurance business',
    'supplemental',
    'health insurance pos',
    'Medicaid',
    'health insurance operations',
    'open enrollment',
    'health insurance services',
    'benefits broker',
  ],

  synonyms: [
    'health insurance platform',
    'health insurance software',
    'health broker software',
    'Medicare software',
    'health plans software',
    'ACA insurance software',
    'health insurance agency software',
    'group health software',
    'benefits broker software',
    'health enrollment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'healthcare provider'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Plans and enrollment' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Clients and policies' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'agent', name: 'Health Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/policies' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a health insurance agency platform',
    'Create a Medicare enrollment app',
    'I need a health plan comparison system',
    'Build a benefits broker platform',
    'Create a health insurance client portal',
  ],
};
