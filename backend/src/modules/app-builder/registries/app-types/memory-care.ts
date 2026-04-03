/**
 * Memory Care App Type Definition
 *
 * Complete definition for memory care and dementia care facilities.
 * Essential for Alzheimer's care, dementia units, and memory care communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEMORY_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'memory-care',
  name: 'Memory Care',
  category: 'seniors',
  description: 'Memory care platform with resident tracking, care documentation, family updates, and specialized activity programs',
  icon: 'brain',

  keywords: [
    'memory care',
    'dementia care',
    'memory care software',
    'alzheimers care',
    'memory care facility',
    'memory care management',
    'cognitive care',
    'memory care unit',
    'memory care scheduling',
    'dementia facility',
    'memory care crm',
    'secure memory',
    'memory care business',
    'memory support',
    'memory care pos',
    'specialized dementia',
    'memory care operations',
    'memory programs',
    'memory care services',
    'behavioral care',
  ],

  synonyms: [
    'memory care platform',
    'memory care software',
    'dementia care software',
    'alzheimers care software',
    'memory care facility software',
    'cognitive care software',
    'memory care unit software',
    'dementia facility software',
    'memory support software',
    'specialized dementia software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general hospital'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Resident updates and care' },
    { id: 'admin', name: 'Care Dashboard', enabled: true, basePath: '/admin', requiredRole: 'caregiver', layout: 'admin', description: 'Residents and documentation' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Care Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/residents' },
    { id: 'caregiver', name: 'Memory Care Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/care-logs' },
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

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'seniors',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
    'Build a memory care facility platform',
    'Create a dementia care management app',
    'I need an Alzheimers care tracking system',
    'Build a memory care family portal',
    'Create a specialized dementia care platform',
  ],
};
