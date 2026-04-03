/**
 * Electrician App Type Definition
 *
 * Complete definition for electrical contractor applications.
 * Essential for electricians, electrical contractors, and electrical service companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRICIAN_APP_TYPE: AppTypeDefinition = {
  id: 'electrician',
  name: 'Electrician',
  category: 'energy',
  description: 'Electrician platform with job scheduling, estimating, permit tracking, and customer management',
  icon: 'zap',

  keywords: [
    'electrician',
    'electrical contractor',
    'electrical service',
    'electrician software',
    'electrical work',
    'electrical scheduling',
    'electrical estimating',
    'electrical business',
    'electrical company',
    'electrical repair',
    'electrical installation',
    'wiring service',
    'electrical permits',
    'residential electrical',
    'commercial electrical',
    'electrical jobs',
    'electrical dispatch',
    'electrical crew',
    'electrical maintenance',
    'electrical inspection',
  ],

  synonyms: [
    'electrician platform',
    'electrician software',
    'electrical contractor software',
    'electrical service software',
    'electrical scheduling software',
    'electrical estimating software',
    'electrical business software',
    'electrical company software',
    'electrical dispatch software',
    'electrical management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'electric car'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and scheduling' },
    { id: 'admin', name: 'Electrician Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'technician', name: 'Electrician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'clients',
    'invoicing',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'inventory',
    'appointments',
    'gallery',
    'reviews',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'energy',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an electrician scheduling platform',
    'Create an electrical contractor app',
    'I need an electrical service management system',
    'Build an electrical estimating app',
    'Create an electrician business platform',
  ],
};
