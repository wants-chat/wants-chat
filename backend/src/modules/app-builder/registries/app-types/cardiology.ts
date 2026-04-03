/**
 * Cardiology App Type Definition
 *
 * Complete definition for cardiology practices and heart centers.
 * Essential for cardiologists, cardiac testing, and heart health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CARDIOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'cardiology',
  name: 'Cardiology',
  category: 'healthcare',
  description: 'Cardiology platform with patient scheduling, EKG/echo management, cardiac rehab tracking, and referral coordination',
  icon: 'heart-pulse',

  keywords: [
    'cardiology',
    'cardiologist',
    'cardiology software',
    'heart center',
    'cardiac care',
    'cardiology management',
    'EKG',
    'cardiology practice',
    'cardiology scheduling',
    'echocardiogram',
    'cardiology crm',
    'stress test',
    'cardiology business',
    'heart health',
    'cardiology pos',
    'cardiac rehab',
    'cardiology operations',
    'interventional',
    'cardiology services',
    'electrophysiology',
  ],

  synonyms: [
    'cardiology platform',
    'cardiology software',
    'cardiologist software',
    'heart center software',
    'cardiac care software',
    'EKG software',
    'cardiology practice software',
    'echocardiogram software',
    'cardiac rehab software',
    'electrophysiology software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and results' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Cardiologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Clinical Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'vital-signs',
    'treatment-plans',
    'medical-imaging',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'prescriptions',
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a cardiology practice platform',
    'Create a heart center patient portal',
    'I need a cardiac testing management system',
    'Build a cardiologist scheduling platform',
    'Create a cardiac rehab tracking app',
  ],
};
