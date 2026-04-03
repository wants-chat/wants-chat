/**
 * Urgent Care App Type Definition
 *
 * Complete definition for urgent care and walk-in clinic applications.
 * Essential for urgent care centers, walk-in clinics, and immediate care facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const URGENT_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'urgent-care',
  name: 'Urgent Care',
  category: 'healthcare',
  description: 'Urgent care platform with online check-in, wait time display, walk-in queue management, and rapid visit documentation',
  icon: 'stethoscope',

  keywords: [
    'urgent care',
    'walk-in clinic',
    'immediate care',
    'urgent care center',
    'after hours clinic',
    'weekend clinic',
    'minor emergency',
    'express care',
    'quick care',
    'convenience clinic',
    'retail clinic',
    'minute clinic',
    'fast track',
    'same day care',
    'no appointment',
    'walk-in doctor',
    'urgent medical',
    'emergency alternative',
    'extended hours',
    'occupational health',
    'workers comp',
  ],

  synonyms: [
    'urgent care platform',
    'urgent care software',
    'walk-in clinic software',
    'urgent care app',
    'immediate care software',
    'urgent care scheduling',
    'walk-in queue system',
    'urgent care check-in',
    'express care software',
    'quick care app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Check-in online and see wait times' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'provider', layout: 'admin', description: 'Queue management and patient care' },
  ],

  roles: [
    { id: 'admin', name: 'Clinic Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Physician', level: 90, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'provider', name: 'Mid-Level Provider', level: 80, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'nurse', name: 'Nurse', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/triage' },
    { id: 'tech', name: 'Medical Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/labs' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'patient-records',
    'vital-signs',
    'prescriptions',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'treatment-plans',
    'lab-results',
    'referrals',
    'immunizations',
    'medical-imaging',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'membership-subscriptions'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an urgent care check-in platform',
    'Create a walk-in clinic queue system',
    'I need an urgent care management app',
    'Build a same-day care center platform',
    'Create an immediate care clinic app',
  ],
};
