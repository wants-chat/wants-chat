/**
 * Brow Bar App Type Definition
 *
 * Complete definition for brow bar operations.
 * Essential for eyebrow studios, brow artists, and threading salons.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BROW_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'brow-bar',
  name: 'Brow Bar',
  category: 'beauty',
  description: 'Brow bar platform with appointment booking, service menu, client preferences, and before/after gallery',
  icon: 'eye',

  keywords: [
    'brow bar',
    'eyebrow studio',
    'brow bar software',
    'brow artist',
    'threading salon',
    'brow bar management',
    'appointment booking',
    'brow bar practice',
    'brow bar scheduling',
    'service menu',
    'brow bar crm',
    'client preferences',
    'brow bar business',
    'before after gallery',
    'brow bar pos',
    'microblading',
    'brow bar operations',
    'brow lamination',
    'brow bar platform',
    'brow tinting',
  ],

  synonyms: [
    'brow bar platform',
    'brow bar software',
    'eyebrow studio software',
    'brow artist software',
    'threading salon software',
    'appointment booking software',
    'brow bar practice software',
    'service menu software',
    'client preferences software',
    'brow lamination software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and gallery' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Brow Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'receptionist', name: 'Receptionist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a brow bar platform',
    'Create an eyebrow studio portal',
    'I need a brow bar management system',
    'Build an appointment booking platform',
    'Create a client and gallery app',
  ],
};
