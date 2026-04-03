/**
 * Speech Therapy App Type Definition
 *
 * Complete definition for speech therapy practice operations.
 * Essential for speech pathology clinics and language therapy centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPEECH_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'speech-therapy',
  name: 'Speech Therapy',
  category: 'healthcare',
  description: 'Speech therapy platform with patient scheduling, treatment plans, progress monitoring, and insurance management',
  icon: 'mic',

  keywords: [
    'speech therapy',
    'speech pathology',
    'speech therapy software',
    'slp clinic',
    'language therapy',
    'speech therapy management',
    'patient scheduling',
    'speech therapy practice',
    'speech therapy scheduling',
    'treatment plans',
    'speech therapy crm',
    'progress monitoring',
    'speech therapy business',
    'insurance management',
    'speech therapy pos',
    'articulation therapy',
    'speech therapy operations',
    'fluency disorders',
    'speech therapy platform',
    'voice therapy',
  ],

  synonyms: [
    'speech therapy platform',
    'speech therapy software',
    'speech pathology software',
    'slp clinic software',
    'language therapy software',
    'patient scheduling software',
    'speech therapy practice software',
    'treatment plans software',
    'progress monitoring software',
    'voice therapy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and exercises' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and treatment' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'therapist', name: 'Speech Pathologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Administrative Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scheduling' },
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

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a speech therapy platform',
    'Create an SLP clinic portal',
    'I need a speech therapy practice management system',
    'Build a treatment planning platform',
    'Create a progress monitoring and billing app',
  ],
};
