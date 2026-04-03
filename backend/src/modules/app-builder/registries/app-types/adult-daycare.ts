/**
 * Adult Daycare App Type Definition
 *
 * Complete definition for adult day care centers and day programs.
 * Essential for adult day health centers, social day programs, and respite care.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADULT_DAYCARE_APP_TYPE: AppTypeDefinition = {
  id: 'adult-daycare',
  name: 'Adult Daycare',
  category: 'seniors',
  description: 'Adult daycare platform with attendance tracking, activity management, transportation, and family communication',
  icon: 'sun',

  keywords: [
    'adult daycare',
    'adult day care',
    'adult daycare software',
    'day program',
    'adult day health',
    'adult daycare management',
    'senior daycare',
    'adult day center',
    'adult daycare scheduling',
    'respite daycare',
    'adult daycare crm',
    'social day program',
    'adult daycare business',
    'dementia daycare',
    'adult daycare pos',
    'therapeutic day',
    'adult daycare operations',
    'day activities',
    'adult daycare services',
    'structured day program',
  ],

  synonyms: [
    'adult daycare platform',
    'adult daycare software',
    'adult day care software',
    'day program software',
    'adult day health software',
    'senior daycare software',
    'adult day center software',
    'respite care software',
    'social day program software',
    'adult day services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'childcare'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and attendance' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Participants and activities' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/participants' },
    { id: 'staff', name: 'Activity Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'waitlist',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'seniors',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build an adult daycare center platform',
    'Create a senior day program app',
    'I need an adult day health center system',
    'Build an adult day services management platform',
    'Create a respite daycare app',
  ],
};
