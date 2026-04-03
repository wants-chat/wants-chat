/**
 * Veterinary Hospital App Type Definition
 *
 * Complete definition for veterinary hospital operations.
 * Essential for animal hospitals, emergency vet clinics, and specialty veterinary practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_HOSPITAL_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary-hospital',
  name: 'Veterinary Hospital',
  category: 'healthcare',
  description: 'Veterinary hospital platform with patient records, appointment scheduling, treatment tracking, and prescription management',
  icon: 'stethoscope',

  keywords: [
    'veterinary hospital',
    'animal hospital',
    'veterinary hospital software',
    'emergency vet',
    'vet clinic',
    'veterinary hospital management',
    'patient records',
    'veterinary hospital practice',
    'veterinary hospital scheduling',
    'appointment scheduling',
    'veterinary hospital crm',
    'treatment tracking',
    'veterinary hospital business',
    'prescription management',
    'veterinary hospital pos',
    'pet surgery',
    'veterinary hospital operations',
    'diagnostic imaging',
    'veterinary hospital platform',
    'lab work',
  ],

  synonyms: [
    'veterinary hospital platform',
    'veterinary hospital software',
    'animal hospital software',
    'emergency vet software',
    'vet clinic software',
    'patient records software',
    'veterinary hospital practice software',
    'appointment scheduling software',
    'treatment tracking software',
    'pet surgery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Pet Owner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and records' },
    { id: 'admin', name: 'Hospital Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Hospital Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'veterinarian', name: 'Veterinarian', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'technician', name: 'Vet Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/treatments' },
    { id: 'client', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'prescriptions',
    'treatment-plans',
    'immunizations',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'lab-results',
    'medical-imaging',
    'referrals',
    'vital-signs',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a veterinary hospital platform',
    'Create an animal hospital app',
    'I need a vet clinic management system',
    'Build an emergency vet practice app',
    'Create a veterinary hospital portal',
  ],
};
