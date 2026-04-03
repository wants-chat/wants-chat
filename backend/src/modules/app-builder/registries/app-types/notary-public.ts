/**
 * Notary Public App Type Definition
 *
 * Complete definition for notary public service operations.
 * Essential for notaries, mobile notary services, and signing agents.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NOTARY_PUBLIC_APP_TYPE: AppTypeDefinition = {
  id: 'notary-public',
  name: 'Notary Public',
  category: 'professional-services',
  description: 'Notary public platform with appointment scheduling, document tracking, journal management, and remote notarization',
  icon: 'stamp',

  keywords: [
    'notary public',
    'mobile notary',
    'notary public software',
    'signing agent',
    'notarization',
    'notary public management',
    'appointment scheduling',
    'notary public practice',
    'notary public scheduling',
    'document tracking',
    'notary public crm',
    'journal management',
    'notary public business',
    'remote notarization',
    'notary public pos',
    'loan signing',
    'notary public operations',
    'ron notary',
    'notary public platform',
    'apostille service',
  ],

  synonyms: [
    'notary public platform',
    'notary public software',
    'mobile notary software',
    'signing agent software',
    'notarization software',
    'appointment scheduling software',
    'notary public practice software',
    'document tracking software',
    'journal management software',
    'loan signing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and documents' },
    { id: 'admin', name: 'Notary Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and journal' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'notary', name: 'Notary Public', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'assistant', name: 'Office Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'appointments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'matter-notes',
    'client-portal',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a notary public platform',
    'Create a mobile notary app',
    'I need a signing agent system',
    'Build a notarization service app',
    'Create a notary public portal',
  ],
};
