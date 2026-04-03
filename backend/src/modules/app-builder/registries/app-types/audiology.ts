/**
 * Audiology App Type Definition
 *
 * Complete definition for audiology practice operations.
 * Essential for hearing clinics and audiologist practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'audiology',
  name: 'Audiology',
  category: 'healthcare',
  description: 'Audiology platform with patient scheduling, hearing tests, hearing aid management, and insurance processing',
  icon: 'ear',

  keywords: [
    'audiology',
    'hearing clinic',
    'audiology software',
    'audiologist',
    'hearing specialist',
    'audiology management',
    'patient scheduling',
    'audiology practice',
    'audiology scheduling',
    'hearing tests',
    'audiology crm',
    'hearing aid management',
    'audiology business',
    'insurance processing',
    'audiology pos',
    'tinnitus treatment',
    'audiology operations',
    'cochlear implants',
    'audiology platform',
    'hearing rehabilitation',
  ],

  synonyms: [
    'audiology platform',
    'audiology software',
    'hearing clinic software',
    'audiologist software',
    'hearing specialist software',
    'patient scheduling software',
    'audiology practice software',
    'hearing tests software',
    'hearing aid management software',
    'hearing rehabilitation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and devices' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and hearing aids' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'audiologist', name: 'Audiologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Front Desk Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scheduling' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
    'analytics',
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an audiology platform',
    'Create a hearing clinic portal',
    'I need an audiology practice management system',
    'Build a hearing aid management platform',
    'Create a patient records and device tracking app',
  ],
};
