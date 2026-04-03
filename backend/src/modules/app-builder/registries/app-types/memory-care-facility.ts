/**
 * Memory Care Facility App Type Definition
 *
 * Complete definition for memory care facility operations.
 * Essential for dementia care centers, Alzheimer's facilities, and specialized memory units.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEMORY_CARE_FACILITY_APP_TYPE: AppTypeDefinition = {
  id: 'memory-care-facility',
  name: 'Memory Care Facility',
  category: 'healthcare',
  description: 'Memory care platform with resident management, care plans, family updates, and activity scheduling',
  icon: 'brain',

  keywords: [
    'memory care facility',
    'dementia care',
    'memory care facility software',
    'alzheimers care',
    'memory unit',
    'memory care facility management',
    'resident management',
    'memory care facility practice',
    'memory care facility scheduling',
    'care plans',
    'memory care facility crm',
    'family updates',
    'memory care facility business',
    'activity scheduling',
    'memory care facility pos',
    'cognitive care',
    'memory care facility operations',
    'secure environment',
    'memory care facility platform',
    'life enrichment',
  ],

  synonyms: [
    'memory care facility platform',
    'memory care facility software',
    'dementia care software',
    'alzheimers care software',
    'memory unit software',
    'resident management software',
    'memory care facility practice software',
    'care plans software',
    'family updates software',
    'cognitive care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and visits' },
    { id: 'admin', name: 'Care Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Residents and care' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'nurse', name: 'Care Nurse', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/residents' },
    { id: 'caregiver', name: 'Caregiver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
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
    'gallery',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'caring',

  examplePrompts: [
    'Build a memory care facility platform',
    'Create a dementia care app',
    'I need an Alzheimers care system',
    'Build a memory unit management app',
    'Create a memory care portal',
  ],
};
