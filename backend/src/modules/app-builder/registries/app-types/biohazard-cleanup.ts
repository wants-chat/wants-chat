/**
 * Biohazard Cleanup App Type Definition
 *
 * Complete definition for biohazard cleanup and crime scene remediation applications.
 * Essential for biohazard cleanup companies, crime scene cleaners, and trauma restoration.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BIOHAZARD_CLEANUP_APP_TYPE: AppTypeDefinition = {
  id: 'biohazard-cleanup',
  name: 'Biohazard Cleanup',
  category: 'cleaning',
  description: 'Biohazard cleanup platform with emergency dispatch, safety compliance, disposal tracking, and sensitive case management',
  icon: 'alert-triangle',

  keywords: [
    'biohazard cleanup',
    'crime scene cleanup',
    'biohazard remediation',
    'cleanup software',
    'trauma cleanup',
    'biohazard booking',
    'blood cleanup',
    'hazmat cleanup',
    'cleanup scheduling',
    'biohazard disposal',
    'cleanup crm',
    'death cleanup',
    'cleanup business',
    'biohazard services',
    'cleanup pos',
    'hoarding cleanup',
    'cleanup management',
    'infectious waste',
    'cleanup services',
    'forensic cleanup',
  ],

  synonyms: [
    'biohazard cleanup platform',
    'biohazard cleanup software',
    'crime scene cleanup software',
    'trauma cleanup software',
    'biohazard remediation software',
    'hazmat cleanup software',
    'biohazard scheduling software',
    'biohazard management software',
    'forensic cleanup software',
    'biohazard services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'lab research'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Emergency requests' },
    { id: 'admin', name: 'Cleanup Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Cases and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'cleaning',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a biohazard cleanup platform',
    'Create a crime scene cleanup dispatch app',
    'I need a trauma cleanup management system',
    'Build a biohazard disposal tracking app',
    'Create a hoarding cleanup platform',
  ],
};
