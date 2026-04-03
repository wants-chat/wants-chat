/**
 * Allergy Clinic App Type Definition
 *
 * Complete definition for allergy clinic operations.
 * Essential for allergists and immunology practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALLERGY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'allergy-clinic',
  name: 'Allergy Clinic',
  category: 'healthcare',
  description: 'Allergy clinic platform with patient scheduling, allergy testing, immunotherapy tracking, and insurance billing',
  icon: 'flower',

  keywords: [
    'allergy clinic',
    'allergist',
    'allergy clinic software',
    'immunology',
    'allergy testing',
    'allergy clinic management',
    'patient scheduling',
    'allergy clinic practice',
    'allergy clinic scheduling',
    'immunotherapy',
    'allergy clinic crm',
    'allergy shots',
    'allergy clinic business',
    'insurance billing',
    'allergy clinic pos',
    'food allergies',
    'allergy clinic operations',
    'asthma treatment',
    'allergy clinic platform',
    'skin testing',
  ],

  synonyms: [
    'allergy clinic platform',
    'allergy clinic software',
    'allergist software',
    'immunology software',
    'allergy testing software',
    'patient scheduling software',
    'allergy clinic practice software',
    'immunotherapy software',
    'allergy shots software',
    'asthma treatment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and treatments' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and immunotherapy' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'allergist', name: 'Allergist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'nurse', name: 'Allergy Nurse', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/injections' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'immunizations',
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
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an allergy clinic platform',
    'Create an allergist practice portal',
    'I need an allergy clinic management system',
    'Build an immunotherapy tracking platform',
    'Create a patient records and testing app',
  ],
};
