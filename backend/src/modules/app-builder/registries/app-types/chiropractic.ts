/**
 * Chiropractic App Type Definition
 *
 * Complete definition for chiropractic practice applications.
 * Essential for chiropractors, spinal care centers, and wellness clinics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHIROPRACTIC_APP_TYPE: AppTypeDefinition = {
  id: 'chiropractic',
  name: 'Chiropractic',
  category: 'healthcare',
  description: 'Chiropractic practice platform with appointment scheduling, patient intake, treatment plans, and billing',
  icon: 'spine',

  keywords: [
    'chiropractic',
    'chiropractor',
    'spinal adjustment',
    'back pain',
    'spine care',
    'chiro',
    'spinal health',
    'neck pain',
    'chiropractic clinic',
    'spinal manipulation',
    'chiropractic adjustment',
    'wellness care',
    'posture correction',
    'spinal decompression',
    'chiropractic treatment',
    'pain management',
    'joint pain',
    'chiropractic wellness',
    'sports chiropractic',
    'pediatric chiropractic',
    'prenatal chiropractic',
  ],

  synonyms: [
    'chiropractic platform',
    'chiropractic software',
    'chiropractor software',
    'chiropractic practice software',
    'chiro management system',
    'chiropractic scheduling',
    'chiropractic clinic app',
    'spine care software',
    'chiropractic patient portal',
    'chiropractic office software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book appointments and track progress' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'chiropractor', layout: 'admin', description: 'Patient management and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chiropractor', name: 'Chiropractor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'associate', name: 'Associate Doctor', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'therapist', name: 'Massage Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
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
    'subscriptions',
    'reviews',
    'analytics',
    'prescriptions',
    'referrals',
    'medical-imaging',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a chiropractic practice platform',
    'Create a chiropractor booking app',
    'I need a chiropractic patient portal',
    'Build a spine care clinic system',
    'Create a chiropractic wellness app',
  ],
};
