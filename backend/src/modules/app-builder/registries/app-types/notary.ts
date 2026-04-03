/**
 * Notary App Type Definition
 *
 * Complete definition for notary service operations.
 * Essential for notary publics, mobile notaries, and signing agents.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NOTARY_APP_TYPE: AppTypeDefinition = {
  id: 'notary',
  name: 'Notary',
  category: 'professional-services',
  description: 'Notary platform with appointment scheduling, document tracking, journal management, and mobile service coordination',
  icon: 'stamp',

  keywords: [
    'notary',
    'notary public',
    'notary software',
    'mobile notary',
    'signing agent',
    'notary management',
    'appointment scheduling',
    'notary practice',
    'notary scheduling',
    'document tracking',
    'notary crm',
    'journal management',
    'notary business',
    'mobile service',
    'notary pos',
    'loan signing',
    'notary operations',
    'remote notarization',
    'notary platform',
    'acknowledgments',
  ],

  synonyms: [
    'notary platform',
    'notary software',
    'notary public software',
    'mobile notary software',
    'signing agent software',
    'appointment scheduling software',
    'notary practice software',
    'document tracking software',
    'journal management software',
    'loan signing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and documents' },
    { id: 'admin', name: 'Notary Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedule and journal' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'notary', name: 'Notary', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'staff', name: 'Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a notary platform',
    'Create a mobile notary portal',
    'I need a notary service management system',
    'Build an appointment scheduling platform',
    'Create a journal and document tracking app',
  ],
};
