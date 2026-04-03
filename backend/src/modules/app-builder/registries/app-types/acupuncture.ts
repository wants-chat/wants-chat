/**
 * Acupuncture App Type Definition
 *
 * Complete definition for acupuncture practice applications.
 * Essential for acupuncturists, TCM practitioners, and integrative medicine.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACUPUNCTURE_APP_TYPE: AppTypeDefinition = {
  id: 'acupuncture',
  name: 'Acupuncture',
  category: 'wellness',
  description: 'Acupuncture practice platform with booking, patient intake, treatment records, and herbal medicine tracking',
  icon: 'needle',

  keywords: [
    'acupuncture',
    'acupuncturist',
    'acupuncture software',
    'acupuncture booking',
    'acupuncture practice',
    'tcm',
    'traditional chinese medicine',
    'acupuncture clinic',
    'acupuncture scheduling',
    'acupuncture ehr',
    'chinese medicine',
    'herbal medicine',
    'acupuncture points',
    'acupuncture treatment',
    'integrative medicine',
    'acupuncture appointments',
    'acupuncture business',
    'oriental medicine',
    'acupuncture therapy',
    'holistic medicine',
  ],

  synonyms: [
    'acupuncture platform',
    'acupuncture software',
    'acupuncture practice software',
    'acupuncture booking software',
    'tcm software',
    'acupuncture scheduling software',
    'acupuncture ehr software',
    'acupuncture clinic software',
    'chinese medicine software',
    'acupuncture management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'acupuncture research'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and records' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'practitioner', layout: 'admin', description: 'Patients and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'practitioner', name: 'Acupuncturist', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patients' },
    { id: 'associate', name: 'Associate Practitioner', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'receptionist', name: 'Receptionist', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reminders',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build an acupuncture practice platform',
    'Create an acupuncture booking app',
    'I need a TCM practice management system',
    'Build a chinese medicine clinic app',
    'Create an acupuncture patient portal',
  ],
};
