/**
 * Dental Clinic App Type Definition
 *
 * Complete definition for dental practice and oral healthcare applications.
 * Essential for dentists, orthodontists, and dental clinics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DENTAL_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'dental-clinic',
  name: 'Dental Clinic',
  category: 'healthcare',
  description: 'Dental practice platform with appointment scheduling, patient records, treatment plans, and insurance billing',
  icon: 'tooth',

  keywords: [
    'dental clinic',
    'dentist',
    'dental practice',
    'dental office',
    'orthodontist',
    'dental appointments',
    'teeth cleaning',
    'dental checkup',
    'root canal',
    'dental implants',
    'braces',
    'invisalign',
    'teeth whitening',
    'dental surgery',
    'oral health',
    'dental hygiene',
    'dental crown',
    'dental filling',
    'dental x-ray',
    'pediatric dentist',
    'cosmetic dentistry',
  ],

  synonyms: [
    'dental clinic platform',
    'dental practice software',
    'dentist software',
    'dental office software',
    'dental management system',
    'dental scheduling app',
    'dental patient portal',
    'dental clinic app',
    'dentist booking system',
    'dental practice management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book appointments and view records' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dentist', layout: 'admin', description: 'Patient management and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dentist', name: 'Dentist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'hygienist', name: 'Dental Hygienist', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'assistant', name: 'Dental Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'calendar',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reminders',
    'reviews',
    'analytics',
    'prescriptions',
    'medical-imaging',
    'referrals',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a dental clinic booking platform',
    'Create a dentist appointment system',
    'I need a dental practice management app',
    'Build a dental patient portal',
    'Create an orthodontist scheduling system',
  ],
};
