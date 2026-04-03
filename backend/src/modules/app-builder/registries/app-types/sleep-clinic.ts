/**
 * Sleep Clinic App Type Definition
 *
 * Complete definition for sleep clinic operations.
 * Essential for sleep medicine practices and sleep disorder centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-clinic',
  name: 'Sleep Clinic',
  category: 'healthcare',
  description: 'Sleep clinic platform with patient scheduling, sleep studies, CPAP management, and treatment tracking',
  icon: 'moon',

  keywords: [
    'sleep clinic',
    'sleep medicine',
    'sleep clinic software',
    'sleep study',
    'sleep disorders',
    'sleep clinic management',
    'patient scheduling',
    'sleep clinic practice',
    'sleep clinic scheduling',
    'cpap management',
    'sleep clinic crm',
    'treatment tracking',
    'sleep clinic business',
    'insurance billing',
    'sleep clinic pos',
    'sleep apnea',
    'sleep clinic operations',
    'insomnia treatment',
    'sleep clinic platform',
    'polysomnography',
  ],

  synonyms: [
    'sleep clinic platform',
    'sleep clinic software',
    'sleep medicine software',
    'sleep study software',
    'sleep disorders software',
    'patient scheduling software',
    'sleep clinic practice software',
    'cpap management software',
    'treatment tracking software',
    'polysomnography software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and devices' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and studies' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Sleep Physician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'technician', name: 'Sleep Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/studies' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'vital-signs',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'prescriptions',
    'lab-results',
    'referrals',
    'telemedicine',
    'medical-imaging',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a sleep clinic platform',
    'Create a sleep medicine portal',
    'I need a sleep disorder center management system',
    'Build a CPAP management platform',
    'Create a sleep study and treatment app',
  ],
};
