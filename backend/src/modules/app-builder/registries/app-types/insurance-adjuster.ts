/**
 * Insurance Adjuster App Type Definition
 *
 * Complete definition for insurance adjusters and claims investigation.
 * Essential for independent adjusters, CAT teams, and claims assessment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSURANCE_ADJUSTER_APP_TYPE: AppTypeDefinition = {
  id: 'insurance-adjuster',
  name: 'Insurance Adjuster',
  category: 'insurance',
  description: 'Insurance adjuster platform with claim assignments, inspection scheduling, estimate creation, and photo documentation',
  icon: 'clipboard-list',

  keywords: [
    'insurance adjuster',
    'claims adjuster',
    'insurance adjuster software',
    'independent adjuster',
    'claims investigation',
    'insurance adjuster management',
    'CAT adjuster',
    'field adjuster',
    'insurance adjuster scheduling',
    'property damage',
    'insurance adjuster crm',
    'loss assessment',
    'insurance adjuster business',
    'storm damage',
    'insurance adjuster pos',
    'estimate writing',
    'insurance adjuster operations',
    'inspection',
    'insurance adjuster services',
    'daily claims',
  ],

  synonyms: [
    'insurance adjuster platform',
    'insurance adjuster software',
    'claims adjuster software',
    'independent adjuster software',
    'claims investigation software',
    'CAT adjuster software',
    'field adjuster software',
    'loss assessment software',
    'estimate writing software',
    'daily claims software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'insurance sales'],

  sections: [
    { id: 'frontend', name: 'Carrier Portal', enabled: true, basePath: '/', layout: 'public', description: 'Claims and reports' },
    { id: 'admin', name: 'Adjuster Dashboard', enabled: true, basePath: '/admin', requiredRole: 'adjuster', layout: 'admin', description: 'Assignments and inspections' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/assignments' },
    { id: 'adjuster', name: 'Field Adjuster', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/claims' },
    { id: 'carrier', name: 'Carrier Rep', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'gallery',
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
    'Build an insurance adjuster firm platform',
    'Create a claims inspection app',
    'I need a CAT adjuster management system',
    'Build a field adjuster scheduling platform',
    'Create an estimate writing app',
  ],
};
