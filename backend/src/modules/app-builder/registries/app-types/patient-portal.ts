/**
 * Healthcare Patient Portal App Type Definition
 *
 * Complete definition for healthcare patient portal applications.
 * Essential for clinics, hospitals, and healthcare providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PATIENT_PORTAL_APP_TYPE: AppTypeDefinition = {
  id: 'patient-portal',
  name: 'Healthcare Patient Portal',
  category: 'healthcare',
  description: 'Patient portal with appointments, medical records, prescriptions, and provider communication',
  icon: 'heart-pulse',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'patient portal',
    'healthcare portal',
    'medical portal',
    'health portal',
    'patient management',
    'clinic management',
    'hospital management',
    'ehr',
    'emr',
    'electronic health records',
    'electronic medical records',
    'medical records',
    'health records',
    'patient records',
    'healthcare app',
    'medical app',
    'clinic app',
    'hospital app',
    'patient scheduling',
    'medical appointments',
    'doctor appointments',
    'telemedicine',
    'telehealth',
    'patient communication',
    'prescription management',
    'athenahealth',
    'epic',
    'cerner',
    'mychart',
  ],

  synonyms: [
    'healthcare system',
    'medical system',
    'clinic software',
    'hospital software',
    'patient software',
    'health management',
    'medical management',
    'practice management',
    'patient care platform',
    'digital health platform',
  ],

  negativeKeywords: [
    'fitness',
    'gym',
    'workout',
    'blog',
    'portfolio',
    'ecommerce',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Patient Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Patient-facing portal for appointments and health information',
    },
    {
      id: 'admin',
      name: 'Provider Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'provider',
      layout: 'admin',
      description: 'Healthcare provider dashboard and patient management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'provider',
      name: 'Healthcare Provider',
      level: 80,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/patients',
    },
    {
      id: 'nurse',
      name: 'Nurse/Staff',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/appointments',
    },
    {
      id: 'receptionist',
      name: 'Receptionist',
      level: 30,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/appointments',
    },
    {
      id: 'patient',
      name: 'Patient',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'appointments',
    'notifications',
    'search',
    'patient-records',
    'prescriptions',
    'vital-signs',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'treatment-plans',
    'insurance-billing',
    'telemedicine',
    'lab-results',
    'referrals',
    'immunizations',
    'medical-imaging',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a patient portal for my clinic',
    'Create a healthcare management system',
    'I need a medical appointment booking app',
    'Build an EHR system for my practice',
    'Create a telemedicine platform',
    'I want to build a patient management system',
    'Make a clinic management app with scheduling',
  ],
};
