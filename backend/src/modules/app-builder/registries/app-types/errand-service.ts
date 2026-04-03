/**
 * Errand Service App Type Definition
 *
 * Complete definition for errand running services.
 * Essential for errand runners, task services, and personal help.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ERRAND_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'errand-service',
  name: 'Errand Service',
  category: 'personal-services',
  description: 'Errand service platform with task requests, runner dispatch, real-time tracking, and proof of completion',
  icon: 'zap',

  keywords: [
    'errand service',
    'errand runner',
    'errand service software',
    'task service',
    'personal help',
    'errand service management',
    'task requests',
    'errand service practice',
    'errand service scheduling',
    'runner dispatch',
    'errand service crm',
    'grocery pickup',
    'errand service business',
    'delivery service',
    'errand service pos',
    'package pickup',
    'errand service operations',
    'waiting in line',
    'errand service platform',
    'personal tasks',
  ],

  synonyms: [
    'errand service platform',
    'errand service software',
    'errand runner software',
    'task service software',
    'personal help software',
    'task requests software',
    'errand service practice software',
    'runner dispatch software',
    'grocery pickup software',
    'personal tasks software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Requests and tracking' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Runners and tasks' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'runner', name: 'Errand Runner', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an errand service platform',
    'Create a task runner dispatch portal',
    'I need an errand request management system',
    'Build a personal task service platform',
    'Create a runner tracking and dispatch app',
  ],
};
