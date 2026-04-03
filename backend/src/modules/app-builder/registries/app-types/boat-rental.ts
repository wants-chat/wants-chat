/**
 * Boat Rental App Type Definition
 *
 * Complete definition for boat rental and watercraft charter operations.
 * Essential for boat rental businesses, yacht charters, and marina operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'boat-rental',
  name: 'Boat Rental',
  category: 'entertainment',
  description: 'Boat rental platform with vessel booking, captain services, safety equipment tracking, and weather integration',
  icon: 'sailboat',

  keywords: [
    'boat rental',
    'yacht charter',
    'boat rental software',
    'watercraft rental',
    'marina',
    'boat rental management',
    'vessel booking',
    'boat rental practice',
    'boat rental scheduling',
    'captain services',
    'boat rental crm',
    'safety equipment',
    'boat rental business',
    'weather integration',
    'boat rental pos',
    'pontoon',
    'boat rental operations',
    'fishing boat',
    'boat rental platform',
    'speedboat',
  ],

  synonyms: [
    'boat rental platform',
    'boat rental software',
    'yacht charter software',
    'watercraft rental software',
    'marina software',
    'vessel booking software',
    'boat rental practice software',
    'captain services software',
    'safety equipment software',
    'pontoon software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Boats and booking' },
    { id: 'admin', name: 'Fleet Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and captains' },
  ],

  roles: [
    { id: 'admin', name: 'Marina Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'captain', name: 'Captain', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/trips' },
    { id: 'staff', name: 'Dock Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fleet' },
    { id: 'customer', name: 'Renter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'nautical',

  examplePrompts: [
    'Build a boat rental platform',
    'Create a yacht charter portal',
    'I need a watercraft rental system',
    'Build a marina booking platform',
    'Create a boat fleet management app',
  ],
};
