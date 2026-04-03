/**
 * Urology App Type Definition
 *
 * Complete definition for urology practices and clinics.
 * Essential for urologists, prostate care, and urinary health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UROLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'urology',
  name: 'Urology',
  category: 'healthcare',
  description: 'Urology platform with procedure scheduling, PSA tracking, cystoscopy management, and treatment protocols',
  icon: 'stethoscope',

  keywords: [
    'urology',
    'urologist',
    'urology software',
    'prostate',
    'urinary health',
    'urology management',
    'kidney stones',
    'urology practice',
    'urology scheduling',
    'bladder',
    'urology crm',
    'mens health',
    'urology business',
    'vasectomy',
    'urology pos',
    'incontinence',
    'urology operations',
    'cystoscopy',
    'urology services',
    'erectile dysfunction',
  ],

  synonyms: [
    'urology platform',
    'urology software',
    'urologist software',
    'prostate software',
    'urinary health software',
    'kidney stones software',
    'urology practice software',
    'mens health software',
    'cystoscopy software',
    'incontinence software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and results' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and procedures' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Urologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Clinical Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'lab-results',
    'insurance-billing',
    'medical-imaging',
    'referrals',
    'telemedicine',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a urology practice platform',
    'Create a prostate health patient portal',
    'I need a urological procedure tracking system',
    'Build a urologist scheduling platform',
    'Create a mens health practice app',
  ],
};
