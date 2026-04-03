/**
 * Photography Booking App Type Definition
 *
 * Complete definition for photography booking and portfolio applications.
 * Essential for photographers, videographers, and creative professionals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'photography',
  name: 'Photography Booking',
  category: 'creative',
  description: 'Photography booking platform with portfolios, session booking, galleries, and client proofing',
  icon: 'camera',

  keywords: [
    'photography',
    'photographer',
    'photo booking',
    'photography booking',
    'photo session',
    'photoshoot',
    'wedding photography',
    'portrait photography',
    'event photography',
    'photography portfolio',
    'photo gallery',
    'client gallery',
    'proofing',
    'photo delivery',
    'shootproof',
    'pixieset',
    'honeybook',
    'photography studio',
    'headshots',
    'family photos',
    'videographer',
    'photography packages',
  ],

  synonyms: [
    'photography platform',
    'photographer booking',
    'photo studio software',
    'photography software',
    'photographer app',
    'photo booking system',
    'photography management',
    'studio management',
    'photographer portfolio',
    'creative booking',
  ],

  negativeKeywords: ['blog only', 'ecommerce', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Portfolio & Booking', enabled: true, basePath: '/', layout: 'public', description: 'Public portfolio and booking' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'photographer', layout: 'admin', description: 'Session and client management' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'photographer', name: 'Photographer', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/gallery' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'invoicing',
    'blog',
    'crm',
  ],

  incompatibleFeatures: ['shopping-cart', 'inventory', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a photography booking platform',
    'Create a photographer portfolio with booking',
    'I need a client gallery and proofing app',
    'Build a photography studio management system',
    'Create a wedding photography booking app',
  ],
};
