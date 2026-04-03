/**
 * General Contractor App Type Definition
 *
 * Complete definition for general contractor and construction company applications.
 * Essential for general contractors, builders, and construction companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GENERAL_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'general-contractor',
  name: 'General Contractor',
  category: 'construction',
  description: 'General contractor platform with project management, subcontractor coordination, estimating, and client portal',
  icon: 'hard-hat',

  keywords: [
    'general contractor',
    'construction company',
    'builder',
    'gc software',
    'construction management',
    'contractor software',
    'construction projects',
    'subcontractor management',
    'construction estimating',
    'builder software',
    'construction scheduling',
    'job costing',
    'construction billing',
    'project tracking',
    'homebuilder',
    'commercial construction',
    'residential construction',
    'construction portal',
    'contractor management',
    'build projects',
  ],

  synonyms: [
    'general contractor platform',
    'general contractor software',
    'construction company software',
    'builder software',
    'gc management software',
    'construction project software',
    'contractor management software',
    'construction estimating software',
    'subcontractor management software',
    'construction scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'freelance contractor'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Project updates' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'pm', layout: 'admin', description: 'Projects and subs' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'pm', name: 'Project Manager', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'super', name: 'Superintendent', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'foreman', name: 'Foreman', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'team-management',
    'scheduling',
    'dashboard',
    'notifications',
    'search',
    'project-bids',
    'subcontractor-mgmt',
    'daily-logs',
    'change-orders',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'analytics',
    'material-takeoffs',
    'site-safety',
    'punch-lists',
    'equipment-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a general contractor platform',
    'Create a construction company app',
    'I need a builder project management system',
    'Build a subcontractor coordination platform',
    'Create a construction estimating app',
  ],
};
