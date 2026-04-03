/**
 * Cleaning Services App Type Definition
 *
 * Complete definition for cleaning service booking applications.
 * Essential for cleaning companies, maid services, and janitorial businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLEANING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'cleaning-services',
  name: 'Cleaning Services',
  category: 'services',
  description: 'Cleaning service booking with scheduling, pricing, cleaner management, and customer portal',
  icon: 'spray-can-sparkles',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'cleaning',
    'cleaning service',
    'maid service',
    'house cleaning',
    'home cleaning',
    'office cleaning',
    'commercial cleaning',
    'janitorial',
    'cleaner',
    'housekeeping',
    'deep cleaning',
    'move out cleaning',
    'move in cleaning',
    'carpet cleaning',
    'window cleaning',
    'handy',
    'taskrabbit cleaning',
    'molly maid',
    'merry maids',
    'cleaning booking',
    'cleaning app',
    'cleaning marketplace',
    'cleaner booking',
    'sanitation',
    'disinfection',
  ],

  synonyms: [
    'cleaning platform',
    'maid platform',
    'cleaning booking',
    'cleaner marketplace',
    'cleaning service app',
    'housekeeping app',
    'cleaning management',
    'janitorial service',
    'cleaning business',
    'cleaning company',
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
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Customer booking and service information',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'manager',
      layout: 'admin',
      description: 'Service and cleaner management',
    },
    {
      id: 'vendor',
      name: 'Cleaner Portal',
      enabled: true,
      basePath: '/cleaner',
      requiredRole: 'cleaner',
      layout: 'admin',
      description: 'Cleaner job management and schedule',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Business Owner',
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
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/bookings',
    },
    {
      id: 'cleaner',
      name: 'Cleaner',
      level: 40,
      isDefault: false,
      accessibleSections: ['vendor'],
      defaultRoute: '/cleaner/schedule',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/book',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'feedback',
    'reporting',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
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
    'Build a cleaning service booking app',
    'Create a maid service platform',
    'I need a cleaning business booking system',
    'Build an app for my cleaning company',
    'Create a cleaner marketplace',
    'I want to build a house cleaning app',
    'Make a cleaning service app with scheduling',
  ],
};
