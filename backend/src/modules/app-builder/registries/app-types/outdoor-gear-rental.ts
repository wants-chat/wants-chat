/**
 * Outdoor Gear Rental App Type Definition
 *
 * Complete definition for outdoor equipment rental operations.
 * Essential for outdoor gear rentals, adventure equipment, and recreation rentals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTDOOR_GEAR_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'outdoor-gear-rental',
  name: 'Outdoor Gear Rental',
  category: 'services',
  description: 'Outdoor gear rental platform with inventory management, reservation system, damage tracking, and seasonal pricing',
  icon: 'tent',

  keywords: [
    'outdoor gear rental',
    'adventure equipment',
    'outdoor gear rental software',
    'recreation rental',
    'camping gear',
    'outdoor gear rental management',
    'inventory management',
    'outdoor gear rental practice',
    'outdoor gear rental scheduling',
    'reservation system',
    'outdoor gear rental crm',
    'damage tracking',
    'outdoor gear rental business',
    'seasonal pricing',
    'outdoor gear rental pos',
    'ski rental',
    'outdoor gear rental operations',
    'kayak rental',
    'outdoor gear rental platform',
    'paddle board',
  ],

  synonyms: [
    'outdoor gear rental platform',
    'outdoor gear rental software',
    'adventure equipment software',
    'recreation rental software',
    'camping gear software',
    'inventory management software',
    'outdoor gear rental practice software',
    'reservation system software',
    'damage tracking software',
    'ski rental software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Gear and reservations' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Rental Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Rental Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reservations' },
    { id: 'customer', name: 'Adventurer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build an outdoor gear rental platform',
    'Create an adventure equipment rental app',
    'I need a camping gear rental system',
    'Build a ski rental shop app',
    'Create an outdoor rental portal',
  ],
};
