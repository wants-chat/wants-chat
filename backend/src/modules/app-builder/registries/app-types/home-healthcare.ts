/**
 * Home Healthcare App Type Definition
 *
 * Complete definition for home healthcare and visiting nurse applications.
 * Essential for home health agencies, visiting nurse services, and in-home care providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_HEALTHCARE_APP_TYPE: AppTypeDefinition = {
  id: 'home-healthcare',
  name: 'Home Healthcare',
  category: 'healthcare',
  description: 'Home healthcare platform with visit scheduling, caregiver management, care plans, and documentation',
  icon: 'home-heart',

  keywords: [
    'home healthcare',
    'home health',
    'visiting nurse',
    'home care',
    'in-home care',
    'home health aide',
    'hospice care',
    'palliative care',
    'skilled nursing',
    'home nursing',
    'senior care',
    'elderly care',
    'post-acute care',
    'rehabilitation at home',
    'home physical therapy',
    'home infusion',
    'wound care',
    'medication management',
    'caregiver services',
    'respite care',
    'companion care',
  ],

  synonyms: [
    'home healthcare platform',
    'home health software',
    'visiting nurse software',
    'home care software',
    'home health agency software',
    'in-home care app',
    'home nursing software',
    'caregiver management',
    'home health scheduling',
    'hospice software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'View schedule and care updates' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Scheduling and care management' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'clinical', name: 'Clinical Director', level: 90, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patients' },
    { id: 'coordinator', name: 'Care Coordinator', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scheduling' },
    { id: 'nurse', name: 'Visiting Nurse', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'therapist', name: 'Home Therapist', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'aide', name: 'Home Health Aide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-visits' },
    { id: 'scheduler', name: 'Scheduler', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'patient-records',
    'treatment-plans',
    'vital-signs',
    'prescriptions',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'insurance-billing',
    'referrals',
    'telemedicine',
    'immunizations',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a home healthcare agency platform',
    'Create a visiting nurse scheduling app',
    'I need a home care management system',
    'Build a home health aide scheduling platform',
    'Create a hospice care coordination app',
  ],
};
