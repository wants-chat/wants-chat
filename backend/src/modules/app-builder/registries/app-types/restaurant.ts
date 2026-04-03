/**
 * Restaurant & Food Ordering App Type Definition
 *
 * Complete definition for restaurant management and food ordering applications.
 * Includes menu management, orders, reservations, and delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'restaurant',
  name: 'Restaurant & Food Ordering',
  category: 'commerce',
  description: 'Restaurant management with online ordering, menu management, reservations, and delivery tracking',
  icon: 'utensils',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'restaurant',
    'food ordering',
    'food delivery',
    'menu',
    'online ordering',
    'takeout',
    'takeaway',
    'delivery',
    'cafe',
    'diner',
    'eatery',
    'food order',
    'order food',
    'restaurant management',
    'table reservation',
    'reservation',
    'pos',
    'point of sale',
    'kitchen',
    'uber eats',
    'doordash',
    'grubhub',
    'food app',
  ],

  synonyms: [
    'food ordering system',
    'restaurant system',
    'online food order',
    'food delivery app',
    'restaurant app',
    'dining app',
    'meal ordering',
    'food service',
  ],

  negativeKeywords: [
    'grocery',
    'supermarket',
    'blog',
    'portfolio',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Customer Ordering',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public-facing menu and ordering for customers',
    },
    {
      id: 'admin',
      name: 'Restaurant Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Order management and restaurant operations',
    },
    {
      id: 'vendor',
      name: 'Kitchen Display',
      enabled: true,
      basePath: '/kitchen',
      requiredRole: 'kitchen',
      layout: 'minimal',
      description: 'Kitchen order display system',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Restaurant Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/orders',
    },
    {
      id: 'staff',
      name: 'Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/orders',
    },
    {
      id: 'kitchen',
      name: 'Kitchen Staff',
      level: 30,
      isDefault: false,
      accessibleSections: ['vendor'],
      defaultRoute: '/kitchen',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 10,
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
    'table-reservations',
    'food-ordering',
    'kitchen-display',
    'pos-system',
    'orders',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'inventory',
    'team-management',
    'reporting',
    'discounts',
    'analytics',
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
  multiTenant: false,
  complexity: 'complex',
  industry: 'hospitality',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a restaurant ordering app',
    'Create an online food ordering system',
    'I need a food delivery platform',
    'Build an app for my restaurant with online ordering',
    'Create a menu and ordering system for my cafe',
    'I want to build a takeout ordering app',
    'Make a restaurant management system with reservations',
  ],
};
