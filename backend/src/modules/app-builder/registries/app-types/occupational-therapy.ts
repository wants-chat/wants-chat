/**
 * Occupational Therapy App Type Definition
 *
 * Complete definition for occupational therapy practice operations.
 * Essential for OT clinics, rehabilitation centers, and pediatric therapy.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OCCUPATIONAL_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'occupational-therapy',
  name: 'Occupational Therapy',
  category: 'healthcare',
  description: 'Occupational therapy platform with patient scheduling, treatment plans, progress tracking, and insurance billing',
  icon: 'hand',

  keywords: [
    'occupational therapy',
    'ot clinic',
    'occupational therapy software',
    'rehabilitation',
    'pediatric ot',
    'occupational therapy management',
    'patient scheduling',
    'occupational therapy practice',
    'occupational therapy scheduling',
    'treatment plans',
    'occupational therapy crm',
    'progress tracking',
    'occupational therapy business',
    'insurance billing',
    'occupational therapy pos',
    'sensory therapy',
    'occupational therapy operations',
    'hand therapy',
    'occupational therapy platform',
    'adl training',
  ],

  synonyms: [
    'occupational therapy platform',
    'occupational therapy software',
    'ot clinic software',
    'rehabilitation software',
    'pediatric ot software',
    'patient scheduling software',
    'occupational therapy practice software',
    'treatment plans software',
    'progress tracking software',
    'hand therapy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and progress' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and treatment' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'therapist', name: 'Occupational Therapist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Administrative Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scheduling' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'prescriptions',
    'referrals',
    'telemedicine',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an occupational therapy platform',
    'Create an OT clinic portal',
    'I need an occupational therapy practice management system',
    'Build a treatment planning platform',
    'Create a progress tracking and billing app',
  ],
};
