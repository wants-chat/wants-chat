/**
 * Party Rental App Type Definition
 *
 * Complete definition for party and event rental services.
 * Essential for party rentals, event supplies, and celebration equipment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'party-rental',
  name: 'Party Rental',
  category: 'rental',
  description: 'Party rental platform with event packages, inventory booking, delivery scheduling, and quote builder',
  icon: 'party-popper',

  keywords: [
    'party rental',
    'event rental',
    'party rental software',
    'celebration equipment',
    'event supplies',
    'party rental management',
    'event packages',
    'party rental practice',
    'party rental scheduling',
    'inventory booking',
    'party rental crm',
    'tents tables',
    'party rental business',
    'bounce houses',
    'party rental pos',
    'linens china',
    'party rental operations',
    'decorations',
    'party rental platform',
    'wedding rentals',
  ],

  synonyms: [
    'party rental platform',
    'party rental software',
    'event rental software',
    'celebration equipment software',
    'event supplies software',
    'event packages software',
    'party rental practice software',
    'inventory booking software',
    'tents tables software',
    'wedding rentals software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'technology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rentals and quotes' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Event Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'crew', name: 'Delivery Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'festive',

  examplePrompts: [
    'Build a party rental platform',
    'Create an event rental portal',
    'I need a celebration equipment management system',
    'Build a wedding rental platform',
    'Create an event package and booking app',
  ],
};
