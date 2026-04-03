/**
 * Notary Service App Type Definition
 *
 * Complete definition for notary service and mobile notary applications.
 * Essential for notary publics, mobile notary services, and signing agents.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NOTARY_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'notary-service',
  name: 'Notary Service',
  category: 'professional-services',
  description: 'Notary service platform with appointment scheduling, document management, e-notarization, and journal tracking',
  icon: 'stamp',

  keywords: [
    'notary service',
    'mobile notary',
    'notary public',
    'signing agent',
    'notary software',
    'notary scheduling',
    'e-notarization',
    'ron',
    'remote online notarization',
    'notary booking',
    'notary appointments',
    'notary journal',
    'loan signing',
    'notary fees',
    'document notarization',
    'notary platform',
    'mobile signing',
    'notary commission',
    'notarial acts',
    'notary management',
  ],

  synonyms: [
    'notary service platform',
    'notary service software',
    'mobile notary software',
    'notary scheduling software',
    'e-notarization software',
    'ron platform',
    'notary booking software',
    'signing agent software',
    'notary management software',
    'loan signing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'legal firm'],

  sections: [
    { id: 'frontend', name: 'Booking Portal', enabled: true, basePath: '/', layout: 'public', description: 'Schedule notarization' },
    { id: 'admin', name: 'Notary Dashboard', enabled: true, basePath: '/admin', requiredRole: 'notary', layout: 'admin', description: 'Appointments and journal' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'notary', name: 'Notary Public', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'assistant', name: 'Assistant', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'calendar',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a notary service platform',
    'Create a mobile notary booking app',
    'I need a notary scheduling system',
    'Build an e-notarization platform',
    'Create a signing agent management app',
  ],
};
