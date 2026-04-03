/**
 * Security Services App Type Definition
 *
 * Complete definition for security service and guard management applications.
 * Essential for security companies, guard services, and patrol companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'security-services',
  name: 'Security Services',
  category: 'services',
  description: 'Security services platform with guard scheduling, patrol tracking, incident reporting, and client management',
  icon: 'shield',

  keywords: [
    'security services',
    'security guard',
    'security company',
    'patrol services',
    'securitas',
    'allied universal',
    'g4s',
    'guard management',
    'event security',
    'corporate security',
    'residential security',
    'security patrol',
    'guard tour',
    'incident reporting',
    'security monitoring',
    'access control',
    'security officer',
    'armed guard',
    'mobile patrol',
    'security scheduling',
    'guard tracking',
    'checkpoint',
  ],

  synonyms: [
    'security services platform',
    'guard management software',
    'security company software',
    'patrol tracking app',
    'security scheduling software',
    'guard service app',
    'security management system',
    'security guard app',
    'patrol management software',
    'security operations platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'View reports and request services' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Guard and operations management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'supervisor', name: 'Shift Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/guards' },
    { id: 'guard', name: 'Security Guard', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patrol' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a security guard management platform',
    'Create a patrol tracking app',
    'I need a security company management software',
    'Build a guard scheduling system',
    'Create a security services platform like Securitas',
  ],
};
