/**
 * Excavation App Type Definition
 *
 * Complete definition for excavation contractor applications.
 * Essential for excavation companies, earthwork contractors, and site work.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXCAVATION_APP_TYPE: AppTypeDefinition = {
  id: 'excavation',
  name: 'Excavation',
  category: 'construction',
  description: 'Excavation contractor platform with job scheduling, equipment management, GPS machine control, and estimating',
  icon: 'shovel',

  keywords: [
    'excavation contractor',
    'excavation company',
    'earthwork contractor',
    'site work',
    'excavation software',
    'grading contractor',
    'excavation scheduling',
    'excavation estimating',
    'dirt work',
    'land clearing',
    'trenching',
    'utility excavation',
    'foundation excavation',
    'excavation equipment',
    'site development',
    'mass grading',
    'cut and fill',
    'excavation tracking',
    'excavation business',
    'earthmoving',
  ],

  synonyms: [
    'excavation contractor platform',
    'excavation contractor software',
    'excavation company software',
    'earthwork software',
    'excavation scheduling software',
    'grading contractor software',
    'site work software',
    'excavation estimating software',
    'excavation management software',
    'earthmoving software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'archaeological excavation'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Excavation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Site Foreman', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'operator', name: 'Equipment Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'time-tracking',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'site-safety',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'gallery',
    'team-management',
    'analytics',
    'subcontractor-mgmt',
    'material-takeoffs',
    'change-orders',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an excavation contractor platform',
    'Create an earthwork management app',
    'I need an excavation scheduling system',
    'Build a grading contractor app',
    'Create an excavation estimating platform',
  ],
};
