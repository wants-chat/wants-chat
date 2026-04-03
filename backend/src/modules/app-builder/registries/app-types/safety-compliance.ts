/**
 * Safety Compliance App Type Definition
 *
 * Complete definition for workplace safety and compliance applications.
 * Essential for safety consultants, compliance officers, and EHS departments.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAFETY_COMPLIANCE_APP_TYPE: AppTypeDefinition = {
  id: 'safety-compliance',
  name: 'Safety Compliance',
  category: 'security',
  description: 'Safety compliance platform with inspection management, incident tracking, training records, and regulatory reporting',
  icon: 'clipboard-check',

  keywords: [
    'safety compliance',
    'workplace safety',
    'osha compliance',
    'safety software',
    'ehs software',
    'safety inspection',
    'incident tracking',
    'safety training',
    'safety management',
    'regulatory compliance',
    'safety audit',
    'safety reporting',
    'safety consultant',
    'safety business',
    'hazard tracking',
    'safety culture',
    'safety metrics',
    'safety program',
    'safety documentation',
    'safety officer',
  ],

  synonyms: [
    'safety compliance platform',
    'safety compliance software',
    'workplace safety software',
    'ehs software',
    'osha compliance software',
    'safety management software',
    'safety inspection software',
    'incident tracking software',
    'safety training software',
    'regulatory compliance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'food safety'],

  sections: [
    { id: 'frontend', name: 'Employee Portal', enabled: true, basePath: '/', layout: 'public', description: 'Training and reporting' },
    { id: 'admin', name: 'Safety Dashboard', enabled: true, basePath: '/admin', requiredRole: 'inspector', layout: 'admin', description: 'Inspections and incidents' },
  ],

  roles: [
    { id: 'admin', name: 'Safety Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Safety Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inspections' },
    { id: 'inspector', name: 'Safety Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'supervisor', name: 'Supervisor', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/incidents' },
    { id: 'employee', name: 'Employee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'security',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a safety compliance platform',
    'Create a workplace safety app',
    'I need an OSHA compliance system',
    'Build an EHS management app',
    'Create an incident tracking platform',
  ],
};
