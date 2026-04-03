/**
 * Construction Management App Type Definition
 *
 * Complete definition for construction management and project controls applications.
 * Essential for construction managers, owners reps, and project controls.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONSTRUCTION_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'construction-management',
  name: 'Construction Management',
  category: 'construction',
  description: 'Construction management platform with project controls, document management, schedule tracking, and reporting',
  icon: 'clipboard-check',

  keywords: [
    'construction management',
    'project controls',
    'construction software',
    'cm software',
    'owner representation',
    'construction pm',
    'construction documents',
    'construction scheduling',
    'construction reporting',
    'project management construction',
    'construction tracking',
    'construction budget',
    'construction progress',
    'construction oversight',
    'capital projects',
    'program management',
    'construction administration',
    'construction controls',
    'construction analytics',
    'construction platform',
  ],

  synonyms: [
    'construction management platform',
    'construction management software',
    'project controls software',
    'construction pm software',
    'owner rep software',
    'construction administration software',
    'construction tracking software',
    'construction reporting software',
    'capital project software',
    'program management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general contractor'],

  sections: [
    { id: 'frontend', name: 'Stakeholder Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and status' },
    { id: 'admin', name: 'CM Dashboard', enabled: true, basePath: '/admin', requiredRole: 'cm', layout: 'admin', description: 'Projects and controls' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Director', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'cm', name: 'Construction Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tracking' },
    { id: 'controls', name: 'Project Controls', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/budget' },
    { id: 'inspector', name: 'Inspector', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'stakeholder', name: 'Stakeholder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'documents',
    'reporting',
    'notifications',
    'search',
    'daily-logs',
    'change-orders',
    'site-safety',
    'punch-lists',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'material-takeoffs',
    'equipment-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a construction management platform',
    'Create a project controls app',
    'I need a construction tracking system',
    'Build a capital project management app',
    'Create a construction reporting platform',
  ],
};
