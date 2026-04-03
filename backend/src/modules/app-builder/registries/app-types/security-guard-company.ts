/**
 * Security Guard Company App Type Definition
 *
 * Complete definition for security guard company operations.
 * Essential for security guard services, patrol companies, and protective services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_GUARD_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'security-guard-company',
  name: 'Security Guard Company',
  category: 'services',
  description: 'Security guard platform with scheduling, patrol tracking, incident reporting, and client site management',
  icon: 'shield',

  keywords: [
    'security guard company',
    'security services',
    'security guard company software',
    'patrol company',
    'protective services',
    'security guard company management',
    'scheduling',
    'security guard company practice',
    'security guard company scheduling',
    'patrol tracking',
    'security guard company crm',
    'incident reporting',
    'security guard company business',
    'client site management',
    'security guard company pos',
    'access control',
    'security guard company operations',
    'event security',
    'security guard company platform',
    'mobile patrol',
  ],

  synonyms: [
    'security guard company platform',
    'security guard company software',
    'security services software',
    'patrol company software',
    'protective services software',
    'scheduling software',
    'security guard company practice software',
    'patrol tracking software',
    'incident reporting software',
    'access control software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and scheduling' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Guards and sites' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'guard', name: 'Security Officer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-shifts' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a security guard company platform',
    'Create a security services app',
    'I need a patrol company system',
    'Build a protective services app',
    'Create a security guard company portal',
  ],
};
