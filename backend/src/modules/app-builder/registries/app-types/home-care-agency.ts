/**
 * Home Care Agency App Type Definition
 *
 * Complete definition for home care service operations.
 * Essential for home health agencies, caregiving services, and senior home care.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_CARE_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'home-care-agency',
  name: 'Home Care Agency',
  category: 'healthcare',
  description: 'Home care agency platform with caregiver scheduling, client management, visit verification, and care documentation',
  icon: 'home',

  keywords: [
    'home care agency',
    'home health',
    'home care agency software',
    'caregiving service',
    'senior home care',
    'home care agency management',
    'caregiver scheduling',
    'home care agency practice',
    'home care agency scheduling',
    'client management',
    'home care agency crm',
    'visit verification',
    'home care agency business',
    'care documentation',
    'home care agency pos',
    'personal care',
    'home care agency operations',
    'companion care',
    'home care agency platform',
    'respite care',
  ],

  synonyms: [
    'home care agency platform',
    'home care agency software',
    'home health software',
    'caregiving service software',
    'senior home care software',
    'caregiver scheduling software',
    'home care agency practice software',
    'client management software',
    'visit verification software',
    'personal care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Care and updates' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Caregivers and visits' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Care Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a home care agency platform',
    'Create a home health management app',
    'I need a caregiver scheduling system',
    'Build a senior home care platform',
    'Create a home care service app',
  ],
};
