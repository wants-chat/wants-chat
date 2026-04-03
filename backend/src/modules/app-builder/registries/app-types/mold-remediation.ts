/**
 * Mold Remediation App Type Definition
 *
 * Complete definition for mold remediation and mold removal applications.
 * Essential for mold remediation companies, indoor air quality specialists, and environmental services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOLD_REMEDIATION_APP_TYPE: AppTypeDefinition = {
  id: 'mold-remediation',
  name: 'Mold Remediation',
  category: 'cleaning',
  description: 'Mold remediation platform with inspection scheduling, air quality testing, containment tracking, and clearance documentation',
  icon: 'shield',

  keywords: [
    'mold remediation',
    'mold removal',
    'mold inspection',
    'remediation software',
    'mold testing',
    'remediation booking',
    'black mold',
    'mold cleanup',
    'remediation scheduling',
    'air quality',
    'remediation crm',
    'mold assessment',
    'remediation business',
    'mold abatement',
    'remediation pos',
    'containment',
    'remediation management',
    'mold clearance',
    'remediation services',
    'indoor air quality',
  ],

  synonyms: [
    'mold remediation platform',
    'mold remediation software',
    'mold removal software',
    'mold inspection software',
    'mold testing software',
    'mold cleanup software',
    'mold abatement software',
    'remediation scheduling software',
    'mold remediation management software',
    'indoor air quality software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'mold making'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inspections and quotes' },
    { id: 'admin', name: 'Remediation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Projects and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'inspector', name: 'Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'cleaning',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a mold remediation platform',
    'Create a mold inspection scheduling app',
    'I need a mold removal management system',
    'Build a mold testing and clearance app',
    'Create an indoor air quality platform',
  ],
};
