/**
 * Insurance Claims App Type Definition
 *
 * Complete definition for insurance claims processing and management.
 * Essential for claims departments, TPA services, and claims administration.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSURANCE_CLAIMS_APP_TYPE: AppTypeDefinition = {
  id: 'insurance-claims',
  name: 'Insurance Claims',
  category: 'insurance',
  description: 'Insurance claims platform with intake management, workflow automation, payment processing, and subrogation tracking',
  icon: 'file-check',

  keywords: [
    'insurance claims',
    'claims processing',
    'insurance claims software',
    'claims management',
    'TPA',
    'insurance claims management',
    'claims administration',
    'claims department',
    'insurance claims scheduling',
    'first notice of loss',
    'insurance claims crm',
    'claims workflow',
    'insurance claims business',
    'subrogation',
    'insurance claims pos',
    'claims payment',
    'insurance claims operations',
    'reserves',
    'insurance claims services',
    'litigation management',
  ],

  synonyms: [
    'insurance claims platform',
    'insurance claims software',
    'claims processing software',
    'claims management software',
    'TPA software',
    'claims administration software',
    'claims department software',
    'first notice of loss software',
    'subrogation software',
    'litigation management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'insurance sales'],

  sections: [
    { id: 'frontend', name: 'Claimant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Claims and status' },
    { id: 'admin', name: 'Claims Dashboard', enabled: true, basePath: '/admin', requiredRole: 'examiner', layout: 'admin', description: 'Claims and workflow' },
  ],

  roles: [
    { id: 'admin', name: 'Claims Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Claims Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/claims' },
    { id: 'examiner', name: 'Claims Examiner', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assigned' },
    { id: 'claimant', name: 'Claimant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'insurance',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an insurance claims management platform',
    'Create a claims processing workflow app',
    'I need a TPA claims administration system',
    'Build a subrogation tracking platform',
    'Create a claims intake portal',
  ],
};
