/**
 * Bounce House Rental App Type Definition
 *
 * Complete definition for inflatable rental operations.
 * Essential for bounce house companies, inflatable rentals, and party inflatables.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOUNCE_HOUSE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'bounce-house-rental',
  name: 'Bounce House Rental',
  category: 'services',
  description: 'Bounce house rental platform with availability calendar, delivery zones, safety waivers, and weather policies',
  icon: 'castle',

  keywords: [
    'bounce house rental',
    'inflatable rental',
    'bounce house rental software',
    'party inflatables',
    'jump house',
    'bounce house rental management',
    'availability calendar',
    'bounce house rental practice',
    'bounce house rental scheduling',
    'delivery zones',
    'bounce house rental crm',
    'safety waivers',
    'bounce house rental business',
    'weather policies',
    'bounce house rental pos',
    'water slide',
    'bounce house rental operations',
    'obstacle course',
    'bounce house rental platform',
    'carnival games',
  ],

  synonyms: [
    'bounce house rental platform',
    'bounce house rental software',
    'inflatable rental software',
    'party inflatables software',
    'jump house software',
    'availability calendar software',
    'bounce house rental practice software',
    'delivery zones software',
    'safety waivers software',
    'water slide software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rentals and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Deliveries and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'crew', name: 'Setup Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a bounce house rental platform',
    'Create an inflatable rental booking app',
    'I need a party inflatable system',
    'Build a jump house rental app',
    'Create a water slide rental platform',
  ],
};
