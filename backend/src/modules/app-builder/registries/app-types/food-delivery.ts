/**
 * Food Delivery App Type Definition
 *
 * Complete definition for food delivery platform applications.
 * Essential for multi-restaurant delivery services and food marketplaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'food-delivery',
  name: 'Food Delivery Platform',
  category: 'commerce',
  description: 'Food delivery marketplace with restaurants, orders, drivers, and real-time tracking',
  icon: 'truck',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'food delivery',
    'food delivery platform',
    'delivery platform',
    'uber eats',
    'doordash',
    'grubhub',
    'postmates',
    'deliveroo',
    'just eat',
    'food marketplace',
    'restaurant delivery',
    'meal delivery',
    'food courier',
    'delivery driver',
    'delivery tracking',
    'order tracking',
    'food ordering platform',
    'multi-restaurant',
    'delivery app',
    'food app',
    'delivery service',
    'quick commerce',
    'on-demand delivery',
  ],

  synonyms: [
    'delivery marketplace',
    'food platform',
    'delivery platform',
    'food delivery app',
    'delivery service platform',
    'meal delivery platform',
    'restaurant marketplace',
    'food ordering platform',
    'delivery system',
    'courier platform',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'single restaurant',
    'grocery only',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Customer App',
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
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Platform administration',
    },
    {
      id: 'vendor',
      name: 'Restaurant Dashboard',
      enabled: true,
      basePath: '/restaurant',
      requiredRole: 'restaurant',
      layout: 'admin',
      description: 'Restaurant order management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Platform Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'restaurant',
      name: 'Restaurant Owner',
      level: 60,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/restaurant/orders',
    },
    {
      id: 'driver',
      name: 'Delivery Driver',
      level: 40,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/driver',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'kitchen-display',
    'orders',
    'notifications',
    'search',
    'shipment-tracking',
    'route-optimization',
  ],

  optionalFeatures: [
    'pos-system',
    'payments',
    'reviews',
    'analytics',
    'announcements',
    'fleet-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: [
    'course-management',
    'appointments',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a food delivery platform like DoorDash',
    'Create a multi-restaurant delivery app',
    'I need a food delivery marketplace',
    'Build an Uber Eats clone',
    'Create a delivery platform with driver tracking',
    'I want to build a food delivery service',
    'Make a food delivery app with real-time tracking',
  ],
};
