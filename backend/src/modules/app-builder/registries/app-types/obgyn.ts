/**
 * OBGYN App Type Definition
 *
 * Complete definition for obstetrics and gynecology practices.
 * Essential for OB/GYN doctors, prenatal care, and women's health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OBGYN_APP_TYPE: AppTypeDefinition = {
  id: 'obgyn',
  name: 'OBGYN',
  category: 'healthcare',
  description: 'OBGYN platform with prenatal tracking, appointment scheduling, ultrasound management, and delivery planning',
  icon: 'baby',

  keywords: [
    'obgyn',
    'obstetrics',
    'obgyn software',
    'gynecology',
    'prenatal care',
    'obgyn management',
    'womens health',
    'obgyn practice',
    'obgyn scheduling',
    'pregnancy',
    'obgyn crm',
    'fertility',
    'obgyn business',
    'ultrasound',
    'obgyn pos',
    'delivery',
    'obgyn operations',
    'postpartum',
    'obgyn services',
    'maternal care',
  ],

  synonyms: [
    'obgyn platform',
    'obgyn software',
    'obstetrics software',
    'gynecology software',
    'prenatal care software',
    'womens health software',
    'obgyn practice software',
    'pregnancy software',
    'fertility software',
    'maternal care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and prenatal' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and pregnancies' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'OB/GYN Physician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Clinical Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an OBGYN practice platform',
    'Create a prenatal care patient portal',
    'I need a pregnancy tracking system',
    'Build a womens health practice platform',
    'Create an obstetrics scheduling app',
  ],
};
