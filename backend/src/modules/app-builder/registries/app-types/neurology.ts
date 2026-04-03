/**
 * Neurology App Type Definition
 *
 * Complete definition for neurology practices and brain health centers.
 * Essential for neurologists, brain health, and neurological disorder management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEUROLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'neurology',
  name: 'Neurology',
  category: 'healthcare',
  description: 'Neurology platform with EEG management, seizure tracking, cognitive assessments, and medication management',
  icon: 'brain',

  keywords: [
    'neurology',
    'neurologist',
    'neurology software',
    'brain health',
    'neurological',
    'neurology management',
    'epilepsy',
    'neurology practice',
    'neurology scheduling',
    'stroke',
    'neurology crm',
    'headache',
    'neurology business',
    'multiple sclerosis',
    'neurology pos',
    'parkinsons',
    'neurology operations',
    'EEG',
    'neurology services',
    'cognitive',
  ],

  synonyms: [
    'neurology platform',
    'neurology software',
    'neurologist software',
    'brain health software',
    'neurological software',
    'epilepsy software',
    'neurology practice software',
    'stroke software',
    'EEG software',
    'cognitive software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and tracking' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Neurologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
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
    'medical-imaging',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'vital-signs',
    'insurance-billing',
    'lab-results',
    'referrals',
    'telemedicine',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a neurology practice platform',
    'Create a brain health patient portal',
    'I need a seizure tracking system',
    'Build a neurologist scheduling platform',
    'Create an EEG management app',
  ],
};
