/**
 * Orthopedics App Type Definition
 *
 * Complete definition for orthopedic practices and surgery centers.
 * Essential for orthopedic surgeons, sports medicine, and musculoskeletal care.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORTHOPEDICS_APP_TYPE: AppTypeDefinition = {
  id: 'orthopedics',
  name: 'Orthopedics',
  category: 'healthcare',
  description: 'Orthopedics platform with surgical scheduling, imaging management, rehab coordination, and implant tracking',
  icon: 'bone',

  keywords: [
    'orthopedics',
    'orthopedic surgeon',
    'orthopedics software',
    'sports medicine',
    'joint replacement',
    'orthopedics management',
    'spine surgery',
    'orthopedics practice',
    'orthopedics scheduling',
    'fracture care',
    'orthopedics crm',
    'arthroscopy',
    'orthopedics business',
    'hand surgery',
    'orthopedics pos',
    'physical therapy',
    'orthopedics operations',
    'implants',
    'orthopedics services',
    'musculoskeletal',
  ],

  synonyms: [
    'orthopedics platform',
    'orthopedics software',
    'orthopedic surgeon software',
    'sports medicine software',
    'joint replacement software',
    'spine surgery software',
    'orthopedics practice software',
    'fracture care software',
    'arthroscopy software',
    'musculoskeletal software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and recovery' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and surgeries' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'surgeon', name: 'Orthopedic Surgeon', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
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
    'medical-imaging',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'prescriptions',
    'insurance-billing',
    'referrals',
    'vital-signs',
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
    'Build an orthopedic surgery practice platform',
    'Create a sports medicine patient portal',
    'I need a joint replacement tracking system',
    'Build an orthopedic scheduling platform',
    'Create a surgical outcome tracking app',
  ],
};
