/**
 * Electrical Services App Type Definition
 *
 * Complete definition for electrician and electrical service applications.
 * Essential for electricians, electrical contractors, and power service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRICAL_APP_TYPE: AppTypeDefinition = {
  id: 'electrical',
  name: 'Electrical Services',
  category: 'services',
  description: 'Electrical services platform with service scheduling, estimates, permit tracking, and technician dispatch',
  icon: 'bolt',

  keywords: [
    'electrician',
    'electrical',
    'electrical contractor',
    'electrical service',
    'wiring',
    'electrical repair',
    'panel upgrade',
    'circuit breaker',
    'outlet installation',
    'lighting installation',
    'electrical inspection',
    'ev charger',
    'generator installation',
    'electrical emergency',
    'commercial electrician',
    'residential electrician',
    'industrial electrician',
    'electrical permit',
    'rewiring',
    'smart home',
    'electrical safety',
    'power outage',
  ],

  synonyms: [
    'electrical platform',
    'electrician software',
    'electrical service software',
    'electrician app',
    'electrical management',
    'electrical contractor software',
    'electrician dispatch',
    'electrical business app',
    'electrical scheduling',
    'electrician management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and request estimates' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dispatch and job management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'electrician', name: 'Master Electrician', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'journeyman', name: 'Journeyman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'apprentice', name: 'Apprentice', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'gallery',
    'inventory',
    'time-tracking',
    'reviews',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an electrician service platform',
    'Create an electrical contractor management app',
    'I need an electrical services booking software',
    'Build an electrician dispatch and scheduling system',
    'Create an electrical company management app',
  ],
};
