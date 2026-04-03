/**
 * Safe & Locksmith App Type Definition
 *
 * Complete definition for safe and locksmith service operations.
 * Essential for safe technicians, locksmith services, and security vault specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAFE_LOCKSMITH_APP_TYPE: AppTypeDefinition = {
  id: 'safe-locksmith',
  name: 'Safe & Locksmith',
  category: 'services',
  description: 'Safe and locksmith platform with service scheduling, safe sales, key management, and emergency dispatch',
  icon: 'key',

  keywords: [
    'safe locksmith',
    'safe technician',
    'safe locksmith software',
    'locksmith service',
    'security vault',
    'safe locksmith management',
    'service scheduling',
    'safe locksmith practice',
    'safe locksmith scheduling',
    'safe sales',
    'safe locksmith crm',
    'key management',
    'safe locksmith business',
    'emergency dispatch',
    'safe locksmith pos',
    'safe cracking',
    'safe locksmith operations',
    'commercial locksmith',
    'safe locksmith platform',
    'access control',
  ],

  synonyms: [
    'safe locksmith platform',
    'safe locksmith software',
    'safe technician software',
    'locksmith service software',
    'security vault software',
    'service scheduling software',
    'safe locksmith practice software',
    'safe sales software',
    'key management software',
    'safe cracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and safes' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'technician', name: 'Safe Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a safe and locksmith platform',
    'Create a safe technician app',
    'I need a locksmith service system',
    'Build a security vault specialist app',
    'Create a safe locksmith portal',
  ],
};
