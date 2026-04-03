/**
 * Queue Management App Type Definition
 *
 * Complete definition for queue and waitlist management applications.
 * Essential for service businesses, restaurants, and healthcare facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUEUE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'queue-management',
  name: 'Queue Management',
  category: 'business',
  description: 'Queue and waitlist management with virtual queues, notifications, and analytics',
  icon: 'users-line',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'queue',
    'queue management',
    'queueing',
    'waitlist',
    'wait list',
    'waiting list',
    'virtual queue',
    'line management',
    'queue system',
    'token system',
    'ticket system',
    'take a number',
    'wait time',
    'queue app',
    'waitwhile',
    'qminder',
    'nowait',
    'qlean',
    'check-in',
    'check in',
    'walk-in',
    'walk in',
    'queue display',
    'queue status',
    'customer flow',
    'service queue',
  ],

  synonyms: [
    'waitlist app',
    'queue app',
    'waiting system',
    'queue platform',
    'waitlist platform',
    'line app',
    'queue tracker',
    'wait tracker',
    'queue software',
    'waitlist software',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'social media',
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
      description: 'Customer-facing queue join and status',
    },
    {
      id: 'admin',
      name: 'Service Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Queue management and service operations',
    },
    {
      id: 'vendor',
      name: 'Display Screen',
      enabled: true,
      basePath: '/display',
      requiredRole: 'staff',
      layout: 'minimal',
      description: 'Public queue display for waiting areas',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
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
      defaultRoute: '/admin/queue',
    },
    {
      id: 'staff',
      name: 'Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin', 'vendor'],
      defaultRoute: '/admin/queue',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/join',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'notifications',
  ],

  optionalFeatures: [
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
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a queue management system',
    'Create a virtual waitlist app',
    'I need a queue app for my restaurant',
    'Build a digital queue system',
    'Create a waiting list management app',
    'I want to build a queue management platform',
    'Make a queue app with SMS notifications',
  ],
};
