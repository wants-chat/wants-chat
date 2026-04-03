/**
 * Locksmith App Type Definition
 *
 * Complete definition for locksmith service applications.
 * Essential for locksmiths, security lock services, and key cutting businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOCKSMITH_APP_TYPE: AppTypeDefinition = {
  id: 'locksmith',
  name: 'Locksmith',
  category: 'services',
  description: 'Locksmith platform with emergency dispatch, service booking, key management, and job tracking',
  icon: 'key',

  keywords: [
    'locksmith',
    'lock service',
    'key cutting',
    'lockout service',
    'emergency locksmith',
    '24 hour locksmith',
    'car lockout',
    'house lockout',
    'lock repair',
    'lock installation',
    'rekey',
    'master key',
    'safe opening',
    'access control',
    'smart locks',
    'key duplication',
    'automotive locksmith',
    'commercial locksmith',
    'residential locksmith',
    'lock change',
    'deadbolt installation',
    'pop a lock',
  ],

  synonyms: [
    'locksmith platform',
    'locksmith software',
    'lock service app',
    'locksmith dispatch',
    'locksmith management',
    'locksmith app',
    'lock service software',
    'locksmith business app',
    'key service platform',
    'locksmith booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and request emergency help' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dispatch and job management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'technician', name: 'Locksmith Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'inventory',
    'time-tracking',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a locksmith dispatch platform',
    'Create a locksmith service booking app',
    'I need a locksmith business management software',
    'Build a 24/7 locksmith service app',
    'Create a locksmith app with GPS tracking',
  ],
};
