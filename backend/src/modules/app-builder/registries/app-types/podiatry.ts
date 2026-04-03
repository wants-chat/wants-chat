/**
 * Podiatry App Type Definition
 *
 * Complete definition for podiatry practice operations.
 * Essential for foot and ankle clinics and podiatric medicine practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PODIATRY_APP_TYPE: AppTypeDefinition = {
  id: 'podiatry',
  name: 'Podiatry',
  category: 'healthcare',
  description: 'Podiatry platform with patient scheduling, treatment records, custom orthotics management, and insurance billing',
  icon: 'footprints',

  keywords: [
    'podiatry',
    'foot clinic',
    'podiatry software',
    'podiatrist',
    'ankle specialist',
    'podiatry management',
    'patient scheduling',
    'podiatry practice',
    'podiatry scheduling',
    'treatment records',
    'podiatry crm',
    'custom orthotics',
    'podiatry business',
    'insurance billing',
    'podiatry pos',
    'diabetic foot care',
    'podiatry operations',
    'sports podiatry',
    'podiatry platform',
    'wound care',
  ],

  synonyms: [
    'podiatry platform',
    'podiatry software',
    'foot clinic software',
    'podiatrist software',
    'ankle specialist software',
    'patient scheduling software',
    'podiatry practice software',
    'treatment records software',
    'custom orthotics software',
    'wound care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and records' },
    { id: 'admin', name: 'Clinic Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and treatment' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'podiatrist', name: 'Podiatrist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Medical Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scheduling' },
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
    'medical-imaging',
    'referrals',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a podiatry platform',
    'Create a foot clinic portal',
    'I need a podiatry practice management system',
    'Build an orthotics management platform',
    'Create a patient records and billing app',
  ],
};
