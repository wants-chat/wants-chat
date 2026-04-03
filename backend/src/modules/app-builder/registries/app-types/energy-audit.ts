/**
 * Energy Audit App Type Definition
 *
 * Complete definition for energy auditing and efficiency consulting applications.
 * Essential for energy auditors, efficiency consultants, and HERS raters.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENERGY_AUDIT_APP_TYPE: AppTypeDefinition = {
  id: 'energy-audit',
  name: 'Energy Audit',
  category: 'energy',
  description: 'Energy audit platform with inspection tools, report generation, recommendation tracking, and rebate management',
  icon: 'gauge',

  keywords: [
    'energy audit',
    'energy auditor',
    'energy efficiency',
    'energy audit software',
    'home energy audit',
    'commercial energy audit',
    'energy assessment',
    'energy consultant',
    'hers rating',
    'energy modeling',
    'energy report',
    'energy savings',
    'energy recommendations',
    'energy rebates',
    'building performance',
    'energy inspection',
    'energy analysis',
    'energy audit business',
    'energy certification',
    'energy benchmarking',
  ],

  synonyms: [
    'energy audit platform',
    'energy audit software',
    'energy efficiency software',
    'energy assessment software',
    'energy consultant software',
    'hers rating software',
    'energy modeling software',
    'building performance software',
    'energy inspection software',
    'energy analysis software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'financial audit'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and recommendations' },
    { id: 'admin', name: 'Auditor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'auditor', layout: 'admin', description: 'Audits and reports' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'auditor', name: 'Energy Auditor', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/audits' },
    { id: 'assistant', name: 'Assistant', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reports' },
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
    'gallery',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'energy',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an energy audit platform',
    'Create an energy efficiency consulting app',
    'I need a HERS rating software',
    'Build a home energy audit app',
    'Create an energy assessment platform',
  ],
};
