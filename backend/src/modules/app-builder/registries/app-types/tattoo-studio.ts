/**
 * Tattoo Studio App Type Definition
 *
 * Complete definition for tattoo studio operations.
 * Essential for tattoo shops, tattoo artists, and body art studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TATTOO_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'tattoo-studio',
  name: 'Tattoo Studio',
  category: 'services',
  description: 'Tattoo studio platform with appointment booking, design consultations, portfolio showcase, and deposit management',
  icon: 'pen-tool',

  keywords: [
    'tattoo studio',
    'tattoo shop',
    'tattoo studio software',
    'tattoo artist',
    'body art',
    'tattoo studio management',
    'appointment booking',
    'tattoo studio practice',
    'tattoo studio scheduling',
    'design consultations',
    'tattoo studio crm',
    'portfolio showcase',
    'tattoo studio business',
    'deposit management',
    'tattoo studio pos',
    'custom tattoos',
    'tattoo studio operations',
    'flash designs',
    'tattoo studio platform',
    'cover-ups',
  ],

  synonyms: [
    'tattoo studio platform',
    'tattoo studio software',
    'tattoo shop software',
    'tattoo artist software',
    'body art software',
    'appointment booking software',
    'tattoo studio practice software',
    'design consultations software',
    'portfolio showcase software',
    'custom tattoos software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Portfolio and booking' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and designs' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Tattoo Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'apprentice', name: 'Apprentice', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a tattoo studio platform',
    'Create a tattoo shop portal',
    'I need a tattoo studio management system',
    'Build a portfolio and booking platform',
    'Create a design consultation and deposit app',
  ],
};
