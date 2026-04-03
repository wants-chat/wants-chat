/**
 * Piercing Studio App Type Definition
 *
 * Complete definition for piercing studio operations.
 * Essential for piercing shops, body piercing studios, and jewelry boutiques.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIERCING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'piercing-studio',
  name: 'Piercing Studio',
  category: 'services',
  description: 'Piercing studio platform with appointment booking, jewelry inventory, aftercare tracking, and consent management',
  icon: 'gem',

  keywords: [
    'piercing studio',
    'piercing shop',
    'piercing studio software',
    'body piercing',
    'jewelry boutique',
    'piercing studio management',
    'appointment booking',
    'piercing studio practice',
    'piercing studio scheduling',
    'jewelry inventory',
    'piercing studio crm',
    'aftercare tracking',
    'piercing studio business',
    'consent management',
    'piercing studio pos',
    'ear piercing',
    'piercing studio operations',
    'body jewelry',
    'piercing studio platform',
    'dermal piercings',
  ],

  synonyms: [
    'piercing studio platform',
    'piercing studio software',
    'piercing shop software',
    'body piercing software',
    'jewelry boutique software',
    'appointment booking software',
    'piercing studio practice software',
    'jewelry inventory software',
    'aftercare tracking software',
    'body jewelry software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and jewelry' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'piercer', name: 'Professional Piercer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jewelry' },
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

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a piercing studio platform',
    'Create a piercing shop portal',
    'I need a piercing studio management system',
    'Build a jewelry inventory platform',
    'Create an aftercare and booking app',
  ],
};
