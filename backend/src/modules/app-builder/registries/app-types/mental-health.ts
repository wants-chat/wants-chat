/**
 * Mental Health App Type Definition
 *
 * Complete definition for mental health and counseling applications.
 * Essential for therapists, counselors, psychologists, and mental health clinics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MENTAL_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'mental-health',
  name: 'Mental Health',
  category: 'healthcare',
  description: 'Mental health platform with appointment scheduling, secure messaging, telehealth, and treatment documentation',
  icon: 'brain',

  keywords: [
    'mental health',
    'therapy',
    'counseling',
    'psychologist',
    'psychiatrist',
    'therapist',
    'counselor',
    'mental wellness',
    'psychotherapy',
    'behavioral health',
    'anxiety treatment',
    'depression therapy',
    'couples therapy',
    'family therapy',
    'group therapy',
    'cognitive behavioral therapy',
    'cbt',
    'emdr',
    'trauma therapy',
    'addiction counseling',
    'life coaching',
  ],

  synonyms: [
    'mental health platform',
    'therapy software',
    'counseling software',
    'therapist software',
    'mental health app',
    'counseling practice software',
    'psychology practice software',
    'therapy scheduling',
    'mental health portal',
    'telehealth therapy',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book sessions and access resources' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'therapist', layout: 'admin', description: 'Client management and documentation' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'psychiatrist', name: 'Psychiatrist', level: 90, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'psychologist', name: 'Psychologist', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'therapist', name: 'Therapist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'intern', name: 'Clinical Intern', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'calendar',
    'notifications',
    'patient-records',
    'treatment-plans',
    'telemedicine',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'prescriptions',
    'insurance-billing',
    'referrals',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'calm',

  examplePrompts: [
    'Build a mental health practice platform',
    'Create a therapy booking app',
    'I need a counseling practice management system',
    'Build a teletherapy platform',
    'Create a psychologist patient portal',
  ],
};
