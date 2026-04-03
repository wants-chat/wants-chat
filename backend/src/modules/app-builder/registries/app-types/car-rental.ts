/**
 * Car Rental App Type Definition
 *
 * Complete definition for car rental and vehicle booking applications.
 * Essential for car rental companies, vehicle sharing, and fleet management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'car-rental',
  name: 'Car Rental',
  category: 'transportation',
  description: 'Car rental platform with vehicle fleet, bookings, pricing, and customer management',
  icon: 'car',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'car rental',
    'car hire',
    'vehicle rental',
    'rent a car',
    'car booking',
    'vehicle booking',
    'fleet management',
    'enterprise',
    'hertz',
    'avis',
    'budget',
    'turo',
    'getaround',
    'zipcar',
    'car sharing',
    'vehicle sharing',
    'rental car',
    'auto rental',
    'truck rental',
    'van rental',
    'motorcycle rental',
    'bike rental',
    'scooter rental',
    'vehicle fleet',
    'rental agency',
  ],

  synonyms: [
    'vehicle rental platform',
    'car rental platform',
    'car hire platform',
    'rental car service',
    'vehicle booking system',
    'car rental software',
    'fleet rental',
    'car sharing platform',
    'vehicle rental app',
    'car rental app',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'ride sharing',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Customer vehicle search and booking',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Fleet and booking management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Business Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/bookings',
    },
    {
      id: 'staff',
      name: 'Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/pickups',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/search',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'vehicle-inventory',
    'service-scheduling',
    'calendar',
    'appointments',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'recalls-tracking',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'transportation',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a car rental platform',
    'Create a vehicle rental booking system',
    'I need a car hire app',
    'Build a car sharing platform like Turo',
    'Create a fleet rental management system',
    'I want to build a rent-a-car app',
    'Make a car rental app with online booking',
  ],
};
