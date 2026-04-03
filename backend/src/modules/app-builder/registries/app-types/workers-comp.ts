/**
 * Workers Comp App Type Definition
 *
 * Complete definition for workers compensation insurance.
 * Essential for workers comp specialists, payroll insurance, and workplace injury coverage.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKERS_COMP_APP_TYPE: AppTypeDefinition = {
  id: 'workers-comp',
  name: 'Workers Comp',
  category: 'insurance',
  description: 'Workers comp platform with class code management, payroll integration, audit preparation, and experience modification tracking',
  icon: 'hard-hat',

  keywords: [
    'workers comp',
    'workers compensation',
    'workers comp software',
    'workplace injury',
    'workers comp insurance',
    'workers comp management',
    'class codes',
    'workers comp agency',
    'workers comp scheduling',
    'experience mod',
    'workers comp crm',
    'payroll insurance',
    'workers comp business',
    'premium audit',
    'workers comp pos',
    'injury claims',
    'workers comp operations',
    'NCCI',
    'workers comp services',
    'return to work',
  ],

  synonyms: [
    'workers comp platform',
    'workers comp software',
    'workers compensation software',
    'workplace injury software',
    'workers comp insurance software',
    'class codes software',
    'workers comp agency software',
    'experience mod software',
    'payroll insurance software',
    'premium audit software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'health insurance'],

  sections: [
    { id: 'frontend', name: 'Employer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and claims' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'specialist', layout: 'admin', description: 'Accounts and audits' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Comp Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/accounts' },
    { id: 'specialist', name: 'WC Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/policies' },
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'insurance',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a workers comp agency platform',
    'Create an experience mod tracking app',
    'I need a workers compensation management system',
    'Build a payroll insurance platform',
    'Create a premium audit preparation app',
  ],
};
