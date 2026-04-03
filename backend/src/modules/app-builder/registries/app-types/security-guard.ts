/**
 * Security Guard App Type Definition
 *
 * Complete definition for security guard services.
 * Essential for security companies, patrol services, and guard management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_GUARD_APP_TYPE: AppTypeDefinition = {
  id: 'security-guard',
  name: 'Security Guard',
  category: 'security',
  description: 'Security guard platform with shift scheduling, patrol tracking, incident reporting, and checkpoint management',
  icon: 'shield',

  keywords: [
    'security guard',
    'security company',
    'security guard software',
    'patrol services',
    'guard management',
    'security guard management',
    'shift scheduling',
    'security guard practice',
    'security guard scheduling',
    'patrol tracking',
    'security guard crm',
    'checkpoint tours',
    'security guard business',
    'incident reporting',
    'security guard pos',
    'event security',
    'security guard operations',
    'guard deployment',
    'security guard platform',
    'access control',
  ],

  synonyms: [
    'security guard platform',
    'security guard software',
    'security company software',
    'patrol services software',
    'guard management software',
    'shift scheduling software',
    'security guard practice software',
    'patrol tracking software',
    'checkpoint tours software',
    'incident reporting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and requests' },
    { id: 'admin', name: 'Security Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Guards and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Security Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shifts' },
    { id: 'guard', name: 'Security Guard', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patrol' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a security guard management platform',
    'Create a patrol tracking portal',
    'I need a security company management system',
    'Build a guard scheduling platform',
    'Create an incident reporting and checkpoint app',
  ],
};
