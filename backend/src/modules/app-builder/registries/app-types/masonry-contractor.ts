/**
 * Masonry Contractor App Type Definition
 *
 * Complete definition for masonry and stone contractor applications.
 * Essential for masonry companies, bricklayers, and stone contractors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MASONRY_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'masonry-contractor',
  name: 'Masonry Contractor',
  category: 'construction',
  description: 'Masonry contractor platform with job scheduling, crew management, material tracking, and estimating',
  icon: 'brick-wall',

  keywords: [
    'masonry contractor',
    'masonry company',
    'bricklayer',
    'stone contractor',
    'masonry software',
    'masonry estimating',
    'masonry scheduling',
    'brick laying',
    'block laying',
    'stone masonry',
    'commercial masonry',
    'residential masonry',
    'masonry crew',
    'masonry subcontractor',
    'concrete masonry',
    'masonry repair',
    'tuckpointing',
    'masonry restoration',
    'masonry business',
    'masonry jobs',
  ],

  synonyms: [
    'masonry contractor platform',
    'masonry contractor software',
    'masonry company software',
    'bricklayer software',
    'masonry scheduling software',
    'masonry estimating software',
    'stone contractor software',
    'masonry crew software',
    'masonry management software',
    'brick laying software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'masonry lodge', 'freemasonry'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Masonry Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'mason', name: 'Mason', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
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
    'equipment-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a masonry contractor platform',
    'Create a bricklaying company app',
    'I need a masonry estimating system',
    'Build a stone contractor app',
    'Create a masonry crew management app',
  ],
};
