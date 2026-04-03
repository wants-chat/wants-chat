/**
 * Pulmonology App Type Definition
 *
 * Complete definition for pulmonology practices and respiratory care.
 * Essential for pulmonologists, sleep medicine, and respiratory health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PULMONOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'pulmonology',
  name: 'Pulmonology',
  category: 'healthcare',
  description: 'Pulmonology platform with PFT scheduling, sleep study management, oxygen tracking, and respiratory therapy coordination',
  icon: 'wind',

  keywords: [
    'pulmonology',
    'pulmonologist',
    'pulmonology software',
    'respiratory',
    'lung health',
    'pulmonology management',
    'COPD',
    'pulmonology practice',
    'pulmonology scheduling',
    'asthma',
    'pulmonology crm',
    'sleep medicine',
    'pulmonology business',
    'pulmonary function',
    'pulmonology pos',
    'oxygen therapy',
    'pulmonology operations',
    'bronchoscopy',
    'pulmonology services',
    'sleep apnea',
  ],

  synonyms: [
    'pulmonology platform',
    'pulmonology software',
    'pulmonologist software',
    'respiratory software',
    'lung health software',
    'COPD software',
    'pulmonology practice software',
    'sleep medicine software',
    'pulmonary function software',
    'sleep apnea software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and results' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Pulmonologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Respiratory Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tests' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a pulmonology practice platform',
    'Create a sleep medicine patient portal',
    'I need a respiratory care tracking system',
    'Build a pulmonologist scheduling platform',
    'Create a COPD management app',
  ],
};
