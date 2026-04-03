/**
 * Physical Therapy App Type Definition
 *
 * Complete definition for physical therapy and rehabilitation applications.
 * Essential for PT clinics, rehab centers, and sports medicine facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHYSICAL_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'physical-therapy',
  name: 'Physical Therapy',
  category: 'healthcare',
  description: 'Physical therapy platform with appointment scheduling, exercise programs, progress tracking, and insurance billing',
  icon: 'activity',

  keywords: [
    'physical therapy',
    'physiotherapy',
    'pt clinic',
    'rehabilitation',
    'rehab center',
    'sports therapy',
    'orthopedic therapy',
    'physical therapist',
    'pt exercises',
    'injury recovery',
    'post-surgery rehab',
    'sports medicine',
    'movement therapy',
    'manual therapy',
    'therapeutic exercise',
    'pain rehabilitation',
    'occupational therapy',
    'pelvic floor therapy',
    'vestibular therapy',
    'aquatic therapy',
    'geriatric therapy',
  ],

  synonyms: [
    'physical therapy platform',
    'physical therapy software',
    'pt software',
    'physiotherapy software',
    'rehab clinic software',
    'pt practice management',
    'physical therapy app',
    'rehabilitation software',
    'pt scheduling system',
    'therapy clinic app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book sessions and do home exercises' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'therapist', layout: 'admin', description: 'Patient care and treatment plans' },
  ],

  roles: [
    { id: 'admin', name: 'Clinic Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'therapist', name: 'Physical Therapist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'pta', name: 'PT Assistant', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'aide', name: 'PT Aide', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/exercises' },
    { id: 'receptionist', name: 'Front Desk', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'analytics',
    'calendar',
    'notifications',
    'patient-records',
    'treatment-plans',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'reminders',
    'prescriptions',
    'referrals',
    'vital-signs',
    'telemedicine',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a physical therapy clinic platform',
    'Create a PT practice management app',
    'I need a rehabilitation center system',
    'Build a physiotherapy booking platform',
    'Create a sports rehab patient portal',
  ],
};
