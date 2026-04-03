/**
 * Geriatric Care Manager App Type Definition
 *
 * Complete definition for geriatric care management operations.
 * Essential for aging life care managers, senior care consultants, and elder care coordinators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GERIATRIC_CARE_MANAGER_APP_TYPE: AppTypeDefinition = {
  id: 'geriatric-care-manager',
  name: 'Geriatric Care Manager',
  category: 'healthcare',
  description: 'Geriatric care platform with client assessments, care coordination, resource referrals, and family consultations',
  icon: 'clipboard-check',

  keywords: [
    'geriatric care manager',
    'aging life care',
    'geriatric care manager software',
    'elder care coordinator',
    'senior care consultant',
    'geriatric care manager management',
    'client assessments',
    'geriatric care manager practice',
    'geriatric care manager scheduling',
    'care coordination',
    'geriatric care manager crm',
    'resource referrals',
    'geriatric care manager business',
    'family consultations',
    'geriatric care manager pos',
    'care planning',
    'geriatric care manager operations',
    'crisis intervention',
    'geriatric care manager platform',
    'advocacy services',
  ],

  synonyms: [
    'geriatric care manager platform',
    'geriatric care manager software',
    'aging life care software',
    'elder care coordinator software',
    'senior care consultant software',
    'client assessments software',
    'geriatric care manager practice software',
    'care coordination software',
    'resource referrals software',
    'care planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Care and resources' },
    { id: 'admin', name: 'Manager Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and plans' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Care Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'coordinator', name: 'Care Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/referrals' },
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
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a geriatric care manager platform',
    'Create an aging life care app',
    'I need an elder care coordination system',
    'Build a senior care consultant app',
    'Create a geriatric care portal',
  ],
};
