/**
 * Security Company App Type Definition
 *
 * Complete definition for security guard and patrol service applications.
 * Essential for security companies, guard services, and patrol operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'security-company',
  name: 'Security Company',
  category: 'security',
  description: 'Security company platform with guard scheduling, patrol tracking, incident reporting, and client management',
  icon: 'shield-check',

  keywords: [
    'security company',
    'security guard',
    'security software',
    'guard scheduling',
    'patrol tracking',
    'security management',
    'security services',
    'guard management',
    'security patrol',
    'incident reporting',
    'security business',
    'guard service',
    'security operations',
    'security dispatch',
    'security checkpoint',
    'guard tour',
    'security officer',
    'security agency',
    'security contracts',
    'security monitoring',
  ],

  synonyms: [
    'security company platform',
    'security company software',
    'guard scheduling software',
    'patrol tracking software',
    'security management software',
    'guard service software',
    'security operations software',
    'security patrol software',
    'guard tour software',
    'security dispatch software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'cybersecurity'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and services' },
    { id: 'admin', name: 'Security Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Guards and patrols' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'supervisor', name: 'Site Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patrols' },
    { id: 'guard', name: 'Security Guard', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkpoint' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'check-in',
    'time-tracking',
    'gallery',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a security company platform',
    'Create a guard scheduling app',
    'I need a patrol tracking system',
    'Build a security guard management app',
    'Create a security operations platform',
  ],
};
