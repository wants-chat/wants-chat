/**
 * Laundry Service App Type Definition
 *
 * Complete definition for laundry and dry cleaning applications.
 * Essential for laundromats, dry cleaners, and laundry delivery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAUNDRY_APP_TYPE: AppTypeDefinition = {
  id: 'laundry',
  name: 'Laundry Service',
  category: 'services',
  description: 'Laundry service platform with pickup/delivery, pricing, order tracking, and customer portal',
  icon: 'shirt',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'laundry',
    'laundry service',
    'dry cleaning',
    'dry cleaner',
    'laundromat',
    'wash and fold',
    'laundry pickup',
    'laundry delivery',
    'clothes cleaning',
    'garment cleaning',
    'ironing service',
    'pressing',
    'alterations',
    'rinse',
    'cleanly',
    'washio',
    'laundry app',
    'laundry booking',
    'laundry management',
    'commercial laundry',
    'linen service',
    'uniform service',
    'laundry pos',
    'laundry software',
  ],

  synonyms: [
    'laundry platform',
    'dry cleaning platform',
    'laundry booking system',
    'laundry management system',
    'cleaning service',
    'garment service',
    'laundry delivery app',
    'laundry pickup app',
    'laundromat software',
    'dry cleaning software',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Customer Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Customer ordering and tracking',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Order and operations management',
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
      defaultRoute: '/admin/orders',
    },
    {
      id: 'staff',
      name: 'Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/orders',
    },
    {
      id: 'driver',
      name: 'Driver',
      level: 30,
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
      defaultRoute: '/order',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'orders',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'shipping',
    'reviews',
    'reporting',
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
  complexity: 'moderate',
  industry: 'services',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a laundry service app',
    'Create a dry cleaning booking platform',
    'I need a laundry pickup and delivery app',
    'Build a laundromat management system',
    'Create a laundry service with order tracking',
    'I want to build a laundry booking app',
    'Make a laundry app with pickup scheduling',
  ],
};
