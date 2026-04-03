/**
 * Dermatology App Type Definition
 *
 * Complete definition for dermatology and skin care practice applications.
 * Essential for dermatologists, skin clinics, and cosmetic dermatology centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DERMATOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'dermatology',
  name: 'Dermatology',
  category: 'healthcare',
  description: 'Dermatology practice platform with appointment scheduling, skin condition tracking, cosmetic procedures, and patient records',
  icon: 'scan',

  keywords: [
    'dermatology',
    'dermatologist',
    'skin doctor',
    'skin care clinic',
    'dermatology clinic',
    'acne treatment',
    'skin cancer',
    'mole check',
    'eczema',
    'psoriasis',
    'cosmetic dermatology',
    'botox',
    'fillers',
    'laser treatment',
    'chemical peel',
    'skin rejuvenation',
    'rosacea',
    'hair loss',
    'skin biopsy',
    'mohs surgery',
    'aesthetics',
  ],

  synonyms: [
    'dermatology platform',
    'dermatology software',
    'dermatologist software',
    'skin clinic software',
    'dermatology practice software',
    'skin care clinic app',
    'dermatology scheduling',
    'cosmetic dermatology app',
    'skin doctor software',
    'derm practice management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book appointments and track skin health' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dermatologist', layout: 'admin', description: 'Patient care and procedures' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dermatologist', name: 'Dermatologist', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'pa', name: 'Physician Assistant', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'aesthetician', name: 'Aesthetician', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/cosmetic' },
    { id: 'nurse', name: 'Medical Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patients' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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
    'prescriptions',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'analytics',
    'insurance-billing',
    'medical-imaging',
    'referrals',
    'telemedicine',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a dermatology practice platform',
    'Create a skin clinic booking app',
    'I need a cosmetic dermatology management system',
    'Build a dermatologist patient portal',
    'Create a skin care clinic app with before/after photos',
  ],
};
