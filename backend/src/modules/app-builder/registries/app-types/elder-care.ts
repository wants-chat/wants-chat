/**
 * Elder Care App Type Definition
 *
 * Complete definition for elder care and companion services.
 * Essential for senior care, companion services, and home health aides.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELDER_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'elder-care',
  name: 'Elder Care',
  category: 'personal-services',
  description: 'Elder care platform with caregiver matching, visit scheduling, care logs, and family communication',
  icon: 'users',

  keywords: [
    'elder care',
    'senior care',
    'elder care software',
    'companion services',
    'home health aide',
    'elder care management',
    'caregiver matching',
    'elder care practice',
    'elder care scheduling',
    'care logs',
    'elder care crm',
    'respite care',
    'elder care business',
    'medication reminders',
    'elder care pos',
    'daily activities',
    'elder care operations',
    'family updates',
    'elder care platform',
    'aging in place',
  ],

  synonyms: [
    'elder care platform',
    'elder care software',
    'senior care software',
    'companion services software',
    'home health aide software',
    'caregiver matching software',
    'elder care practice software',
    'care logs software',
    'respite care software',
    'aging in place software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and scheduling' },
    { id: 'admin', name: 'Care Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and caregivers' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Care Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'caregiver', name: 'Caregiver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'healthcare',

  examplePrompts: [
    'Build an elder care platform',
    'Create a senior companion service portal',
    'I need a caregiver management system',
    'Build a home care scheduling platform',
    'Create a family communication and care log app',
  ],
};
