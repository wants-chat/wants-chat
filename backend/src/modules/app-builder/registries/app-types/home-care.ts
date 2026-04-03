/**
 * Home Care App Type Definition
 *
 * Complete definition for in-home care and home health agencies.
 * Essential for home care agencies, caregivers, and home health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'home-care',
  name: 'Home Care',
  category: 'seniors',
  description: 'Home care platform with caregiver scheduling, client management, care plans, and visit tracking',
  icon: 'heart',

  keywords: [
    'home care',
    'home health',
    'home care software',
    'in-home care',
    'caregiver scheduling',
    'home care management',
    'elderly care',
    'home care agency',
    'home care scheduling',
    'personal care',
    'home care crm',
    'companion care',
    'home care business',
    'senior home care',
    'home care pos',
    'respite care',
    'home care operations',
    'care visits',
    'home care services',
    'non-medical care',
  ],

  synonyms: [
    'home care platform',
    'home care software',
    'home health software',
    'in-home care software',
    'caregiver scheduling software',
    'home care agency software',
    'elderly care software',
    'personal care software',
    'companion care software',
    'senior home care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'hospital'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Care updates and schedules' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'caregiver', layout: 'admin', description: 'Clients and visits' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Care Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'caregiver', name: 'Caregiver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'seniors',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a home care agency platform',
    'Create a caregiver scheduling app',
    'I need an in-home care management system',
    'Build a home health visit tracking platform',
    'Create a senior care agency app',
  ],
};
