/**
 * Recording Studio App Type Definition
 *
 * Complete definition for recording studio operations.
 * Essential for music studios, podcast studios, and audio production facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECORDING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'recording-studio',
  name: 'Recording Studio',
  category: 'entertainment',
  description: 'Recording studio platform with room booking, session management, equipment tracking, and client projects',
  icon: 'mic',

  keywords: [
    'recording studio',
    'music studio',
    'recording studio software',
    'podcast studio',
    'audio production',
    'recording studio management',
    'room booking',
    'recording studio practice',
    'recording studio scheduling',
    'session management',
    'recording studio crm',
    'equipment tracking',
    'recording studio business',
    'client projects',
    'recording studio pos',
    'mixing mastering',
    'recording studio operations',
    'sound engineering',
    'recording studio platform',
    'vocal booth',
  ],

  synonyms: [
    'recording studio platform',
    'recording studio software',
    'music studio software',
    'podcast studio software',
    'audio production software',
    'room booking software',
    'recording studio practice software',
    'session management software',
    'equipment tracking software',
    'sound engineering software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and projects' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sessions and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Sound Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a recording studio platform',
    'Create a music studio portal',
    'I need a studio booking system',
    'Build a session management platform',
    'Create an audio production app',
  ],
};
