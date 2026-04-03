/**
 * Oncology App Type Definition
 *
 * Complete definition for oncology practices and cancer centers.
 * Essential for oncologists, chemotherapy management, and cancer care coordination.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONCOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'oncology',
  name: 'Oncology',
  category: 'healthcare',
  description: 'Oncology platform with treatment scheduling, chemotherapy tracking, clinical trials, and care team coordination',
  icon: 'ribbon',

  keywords: [
    'oncology',
    'oncologist',
    'oncology software',
    'cancer center',
    'cancer treatment',
    'oncology management',
    'chemotherapy',
    'oncology practice',
    'oncology scheduling',
    'radiation',
    'oncology crm',
    'tumor',
    'oncology business',
    'immunotherapy',
    'oncology pos',
    'clinical trials',
    'oncology operations',
    'survivorship',
    'oncology services',
    'cancer care',
  ],

  synonyms: [
    'oncology platform',
    'oncology software',
    'oncologist software',
    'cancer center software',
    'cancer treatment software',
    'chemotherapy software',
    'oncology practice software',
    'radiation software',
    'clinical trials software',
    'cancer care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Treatments and support' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and protocols' },
  ],

  roles: [
    { id: 'admin', name: 'Center Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Oncologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Oncology Nurse', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/treatments' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'prescriptions',
    'lab-results',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'vital-signs',
    'insurance-billing',
    'medical-imaging',
    'referrals',
    'telemedicine',
    'immunizations',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an oncology practice platform',
    'Create a cancer center patient portal',
    'I need a chemotherapy tracking system',
    'Build an oncologist scheduling platform',
    'Create a clinical trials management app',
  ],
};
