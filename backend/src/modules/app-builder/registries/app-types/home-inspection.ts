/**
 * Home Inspection App Type Definition
 *
 * Complete definition for home inspection service operations.
 * Essential for home inspectors, property inspection services, and real estate inspection.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_INSPECTION_APP_TYPE: AppTypeDefinition = {
  id: 'home-inspection',
  name: 'Home Inspection',
  category: 'professional-services',
  description: 'Home inspection platform with scheduling, report generation, photo documentation, and client delivery',
  icon: 'home',

  keywords: [
    'home inspection',
    'home inspector',
    'home inspection software',
    'property inspection',
    'real estate inspection',
    'home inspection management',
    'scheduling',
    'home inspection practice',
    'home inspection scheduling',
    'report generation',
    'home inspection crm',
    'photo documentation',
    'home inspection business',
    'client delivery',
    'home inspection pos',
    'pre-purchase inspection',
    'home inspection operations',
    'radon testing',
    'home inspection platform',
    'pest inspection',
  ],

  synonyms: [
    'home inspection platform',
    'home inspection software',
    'home inspector software',
    'property inspection software',
    'real estate inspection software',
    'scheduling software',
    'home inspection practice software',
    'report generation software',
    'photo documentation software',
    'pre-purchase inspection software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and reports' },
    { id: 'admin', name: 'Inspector Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inspections and reports' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'inspector', name: 'Lead Inspector', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'assistant', name: 'Inspector Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'client', name: 'Client/Agent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'gallery',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a home inspection platform',
    'Create a home inspector app',
    'I need a property inspection system',
    'Build a real estate inspection app',
    'Create a home inspection portal',
  ],
};
