/**
 * Hearing Aid Center App Type Definition
 *
 * Complete definition for hearing aid retail and service operations.
 * Essential for hearing aid dispensers, audiologists, and hearing care centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEARING_AID_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'hearing-aid-center',
  name: 'Hearing Aid Center',
  category: 'healthcare',
  description: 'Hearing aid center platform with appointment scheduling, fitting management, device tracking, and follow-up care',
  icon: 'ear',

  keywords: [
    'hearing aid center',
    'audiologist',
    'hearing aid center software',
    'hearing care',
    'hearing dispenser',
    'hearing aid center management',
    'appointment scheduling',
    'hearing aid center practice',
    'hearing aid center scheduling',
    'fitting management',
    'hearing aid center crm',
    'device tracking',
    'hearing aid center business',
    'follow up care',
    'hearing aid center pos',
    'hearing test',
    'hearing aid center operations',
    'ear molds',
    'hearing aid center platform',
    'tinnitus care',
  ],

  synonyms: [
    'hearing aid center platform',
    'hearing aid center software',
    'audiologist software',
    'hearing care software',
    'hearing dispenser software',
    'appointment scheduling software',
    'hearing aid center practice software',
    'fitting management software',
    'device tracking software',
    'hearing test software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and care' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and fittings' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'audiologist', name: 'Audiologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'technician', name: 'Hearing Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fittings' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a hearing aid center platform',
    'Create an audiology practice app',
    'I need a hearing care center system',
    'Build a hearing aid dispenser app',
    'Create a hearing health practice platform',
  ],
};
