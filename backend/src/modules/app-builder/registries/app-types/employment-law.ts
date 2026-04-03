/**
 * Employment Law App Type Definition
 *
 * Complete definition for employment and labor law attorneys.
 * Essential for employment litigation, workplace disputes, and labor relations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMPLOYMENT_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'employment-law',
  name: 'Employment Law',
  category: 'legal',
  description: 'Employment law platform with case intake, EEOC tracking, document discovery, and settlement negotiation',
  icon: 'briefcase',

  keywords: [
    'employment law',
    'employment attorney',
    'employment law software',
    'labor lawyer',
    'workplace disputes',
    'employment law management',
    'wrongful termination',
    'employment firm',
    'employment scheduling',
    'discrimination',
    'employment crm',
    'harassment',
    'employment law business',
    'wage theft',
    'employment pos',
    'EEOC',
    'employment operations',
    'retaliation',
    'employment services',
    'labor relations',
  ],

  synonyms: [
    'employment law platform',
    'employment law software',
    'employment attorney software',
    'labor lawyer software',
    'workplace disputes software',
    'wrongful termination software',
    'employment firm software',
    'discrimination software',
    'EEOC software',
    'labor relations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'staffing agency'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and updates' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and claims' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Employment Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Legal Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/claims' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'matter-notes',
    'client-portal',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an employment law firm platform',
    'Create a workplace dispute case app',
    'I need an EEOC claim tracking system',
    'Build an employment litigation platform',
    'Create a labor law practice app',
  ],
};
