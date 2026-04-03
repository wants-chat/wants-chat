/**
 * Senior Center App Type Definition
 *
 * Complete definition for senior center services.
 * Essential for senior centers, elderly programs, and aging services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'senior-center',
  name: 'Senior Center',
  category: 'community',
  description: 'Senior center platform with program registration, meal services, transportation scheduling, and member management',
  icon: 'users',

  keywords: [
    'senior center',
    'elderly programs',
    'senior center software',
    'aging services',
    'senior activities',
    'senior center management',
    'program registration',
    'senior center practice',
    'senior center scheduling',
    'meal services',
    'senior center crm',
    'transportation',
    'senior center business',
    'wellness programs',
    'senior center pos',
    'social activities',
    'senior center operations',
    'health screenings',
    'senior center platform',
    'day programs',
  ],

  synonyms: [
    'senior center platform',
    'senior center software',
    'elderly programs software',
    'aging services software',
    'senior activities software',
    'program registration software',
    'senior center practice software',
    'meal services software',
    'transportation software',
    'day programs software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and services' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Program Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Staff Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attendance' },
    { id: 'member', name: 'Senior Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'team-management',
    'email',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'nonprofit',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'accessible',

  examplePrompts: [
    'Build a senior center management platform',
    'Create an elderly services portal',
    'I need a senior program registration system',
    'Build a senior activities platform',
    'Create a member and transportation app',
  ],
};
