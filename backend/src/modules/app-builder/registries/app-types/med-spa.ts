/**
 * Med Spa App Type Definition
 *
 * Complete definition for medical spa and aesthetic clinic applications.
 * Essential for med spas, aesthetic clinics, and cosmetic treatment centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MED_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'med-spa',
  name: 'Med Spa',
  category: 'beauty',
  description: 'Medical spa platform with treatment booking, patient records, consent forms, and before/after photos',
  icon: 'sparkles',

  keywords: [
    'med spa',
    'medical spa',
    'medspa',
    'aesthetic clinic',
    'med spa software',
    'botox',
    'fillers',
    'laser treatment',
    'cosmetic procedures',
    'med spa booking',
    'aesthetic treatments',
    'med spa management',
    'medical aesthetics',
    'injectable',
    'skin treatments',
    'med spa scheduling',
    'aesthetic practice',
    'med spa business',
    'med spa crm',
    'body contouring',
  ],

  synonyms: [
    'med spa platform',
    'med spa software',
    'medical spa software',
    'aesthetic clinic software',
    'medspa software',
    'med spa booking software',
    'aesthetic treatment software',
    'cosmetic procedure software',
    'med spa management software',
    'aesthetic practice software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'day spa'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and records' },
    { id: 'admin', name: 'Med Spa Dashboard', enabled: true, basePath: '/admin', requiredRole: 'provider', layout: 'admin', description: 'Patients and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Medical Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Practice Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'provider', name: 'Provider', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/patients' },
    { id: 'aesthetician', name: 'Aesthetician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/treatments' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'gallery',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'discounts',
    'subscriptions',
    'reviews',
    'email',
    'reporting',
    'analytics',
    'prescriptions',
    'insurance-billing',
    'medical-imaging',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'beauty',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a med spa platform',
    'Create an aesthetic clinic app',
    'I need a medical spa booking system',
    'Build a cosmetic treatment app',
    'Create a med spa patient portal',
  ],
};
