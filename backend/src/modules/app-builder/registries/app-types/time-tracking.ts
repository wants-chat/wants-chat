/**
 * Time Tracking App Type Definition
 *
 * Dedicated time tracking applications like Toggl, Clockify, Harvest.
 * Focused on time logging, timers, reports, and project-based tracking.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIME_TRACKING_APP_TYPE: AppTypeDefinition = {
  id: 'time-tracking',
  name: 'Time Tracking',
  category: 'business',
  description: 'Time tracking application with timer, timesheets, project tracking, and reports',
  icon: 'clock',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'time tracker',
    'time tracking',
    'timesheet',
    'timer app',
    'hours tracking',
    'work hours',
    'time log',
    'time logging',
    'clockify',
    'toggl',
    'harvest',
    'billable hours',
    'time entry',
    'track time',
    'stopwatch',
    'pomodoro',
    'work timer',
    'employee time',
    'freelance time',
    'billing hours',
    'time management',
  ],

  synonyms: [
    'time tracker app',
    'timesheet app',
    'hours tracker',
    'work time tracker',
    'employee time tracking',
    'time logging app',
    'project time tracker',
    'freelancer timer',
    'time billing',
    'work hours tracker',
  ],

  negativeKeywords: [
    'ecommerce',
    'shopping',
    'store',
    'blog',
    'social media',
    'chat',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Workspace',
      enabled: true,
      basePath: '/',
      layout: 'admin',
      description: 'Main workspace for time tracking',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Team and settings administration',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'user',
      name: 'User',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'time-tracking', // Primary feature!
  ],

  optionalFeatures: [
    'team-management',
    'reporting',
    'invoicing',
    'email',
    'notifications',
    'calendar',
    'tasks',
    'projects',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'checkout',
    'product-catalog',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: false,
  complexity: 'medium',
  industry: 'business',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a time tracker app',
    'Create a time tracking application',
    'I need a timesheet app for my team',
    'Build an app like Toggl or Clockify',
    'Create a work hours tracker',
    'I want to build a timer app for freelancers',
    'Make a time logging application',
    'Build a billable hours tracker',
  ],
};
