/**
 * Bartender Service App Type Definition
 *
 * Complete definition for mobile bartending operations.
 * Essential for mobile bars, cocktail caterers, and beverage services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BARTENDER_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'bartender-service',
  name: 'Bartender Service',
  category: 'services',
  description: 'Bartender service platform with event booking, menu customization, staff scheduling, and inventory management',
  icon: 'glass-water',

  keywords: [
    'bartender service',
    'mobile bar',
    'bartender service software',
    'cocktail catering',
    'beverage service',
    'bartender service management',
    'event booking',
    'bartender service practice',
    'bartender service scheduling',
    'menu customization',
    'bartender service crm',
    'staff scheduling',
    'bartender service business',
    'inventory management',
    'bartender service pos',
    'mixology catering',
    'bartender service operations',
    'bar cart service',
    'bartender service platform',
    'signature cocktails',
  ],

  synonyms: [
    'bartender service platform',
    'bartender service software',
    'mobile bar software',
    'cocktail catering software',
    'beverage service software',
    'event booking software',
    'bartender service practice software',
    'menu customization software',
    'staff scheduling software',
    'mixology catering software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and menus' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and staff' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Event Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'bartender', name: 'Bartender', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'pos-system',
    'scheduling',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'food-ordering',
    'payments',
    'discounts',
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
  defaultDesignVariant: 'sophisticated',

  examplePrompts: [
    'Build a bartender service platform',
    'Create a mobile bar portal',
    'I need a cocktail catering management system',
    'Build an event booking platform',
    'Create a menu and staff scheduling app',
  ],
};
