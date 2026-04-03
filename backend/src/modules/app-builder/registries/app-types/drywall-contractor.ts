/**
 * Drywall Contractor App Type Definition
 *
 * Complete definition for drywall and plastering contractor applications.
 * Essential for drywall companies, finishing contractors, and interior systems.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRYWALL_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'drywall-contractor',
  name: 'Drywall Contractor',
  category: 'construction',
  description: 'Drywall contractor platform with job scheduling, crew management, material tracking, and estimating',
  icon: 'square',

  keywords: [
    'drywall contractor',
    'drywall company',
    'sheetrock contractor',
    'drywall finishing',
    'drywall installation',
    'drywall software',
    'drywall estimating',
    'drywall scheduling',
    'taping and mudding',
    'drywall repair',
    'commercial drywall',
    'residential drywall',
    'drywall crew',
    'drywall subcontractor',
    'interior finishing',
    'plastering',
    'drywall hanging',
    'drywall business',
    'acoustical ceilings',
    'drywall jobs',
  ],

  synonyms: [
    'drywall contractor platform',
    'drywall contractor software',
    'drywall company software',
    'sheetrock software',
    'drywall scheduling software',
    'drywall estimating software',
    'drywall finishing software',
    'drywall crew software',
    'drywall management software',
    'interior finishing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'drywall texture ideas'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Drywall Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'installer', name: 'Installer', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'inventory',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
    'subcontractor-mgmt',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'time-tracking',
    'appointments',
    'analytics',
    'site-safety',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a drywall contractor platform',
    'Create a drywall crew management app',
    'I need a drywall estimating system',
    'Build a sheetrock installation app',
    'Create a drywall finishing company app',
  ],
};
