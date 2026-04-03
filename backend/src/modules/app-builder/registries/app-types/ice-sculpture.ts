/**
 * Ice Sculpture App Type Definition
 *
 * Complete definition for ice sculpture service operations.
 * Essential for ice artists, event ice services, and frozen art studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ICE_SCULPTURE_APP_TYPE: AppTypeDefinition = {
  id: 'ice-sculpture',
  name: 'Ice Sculpture',
  category: 'services',
  description: 'Ice sculpture platform with custom design requests, event booking, delivery logistics, and gallery showcase',
  icon: 'snowflake',

  keywords: [
    'ice sculpture',
    'ice artist',
    'ice sculpture software',
    'event ice',
    'frozen art',
    'ice sculpture management',
    'custom design',
    'ice sculpture practice',
    'ice sculpture scheduling',
    'event booking',
    'ice sculpture crm',
    'delivery logistics',
    'ice sculpture business',
    'gallery showcase',
    'ice sculpture pos',
    'ice luge',
    'ice sculpture operations',
    'ice bar',
    'ice sculpture platform',
    'centerpieces',
  ],

  synonyms: [
    'ice sculpture platform',
    'ice sculpture software',
    'ice artist software',
    'event ice software',
    'frozen art software',
    'custom design software',
    'ice sculpture practice software',
    'event booking software',
    'delivery logistics software',
    'ice luge software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Designs and orders' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and delivery' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Ice Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'assistant', name: 'Production Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build an ice sculpture platform',
    'Create an ice artist portal',
    'I need an ice sculpture service management system',
    'Build a custom design platform',
    'Create an event booking and delivery app',
  ],
};
