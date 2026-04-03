/**
 * Fitness & Gym Management App Type Definition
 *
 * Complete definition for gym and fitness studio management applications.
 * Essential for gyms, fitness studios, personal trainers, and health clubs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'fitness',
  name: 'Fitness & Gym Management',
  category: 'health-fitness',
  description: 'Gym management with memberships, class scheduling, trainer booking, and workout tracking',
  icon: 'dumbbell',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'gym',
    'fitness',
    'gym management',
    'fitness studio',
    'fitness center',
    'health club',
    'personal trainer',
    'personal training',
    'workout',
    'workout tracking',
    'exercise',
    'fitness app',
    'gym app',
    'membership management',
    'class scheduling',
    'class booking',
    'yoga studio',
    'pilates studio',
    'crossfit',
    'boxing gym',
    'martial arts',
    'mindbody',
    'glofox',
    'gymmaster',
    'wodify',
    'fitness tracker',
    'training app',
    'workout app',
    'sports club',
  ],

  synonyms: [
    'gym software',
    'fitness software',
    'gym system',
    'fitness management',
    'health club software',
    'workout system',
    'training platform',
    'fitness platform',
    'exercise platform',
    'wellness platform',
  ],

  negativeKeywords: [
    'healthcare',
    'medical',
    'hospital',
    'blog',
    'portfolio',
    'ecommerce only',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Member Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Member-facing portal for class booking and workout tracking',
    },
    {
      id: 'admin',
      name: 'Gym Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Gym management dashboard for staff and trainers',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Gym Owner',
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
      defaultRoute: '/admin/members',
    },
    {
      id: 'trainer',
      name: 'Trainer/Instructor',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/schedule',
    },
    {
      id: 'staff',
      name: 'Front Desk Staff',
      level: 30,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/check-in',
    },
    {
      id: 'member',
      name: 'Member',
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
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'workout-tracking',
    'body-measurements',
    'check-in',
    'notifications',
    'search',
    'dashboard',
  ],

  optionalFeatures: [
    'payments',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'equipment-booking',
    'group-training',
    'calendar',
    'analytics',
    'reporting',
    'messaging',
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
  complexity: 'complex',
  industry: 'fitness',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a gym management system',
    'Create a fitness studio booking app',
    'I need a membership management platform for my gym',
    'Build an app for class scheduling and booking',
    'Create a personal training booking system',
    'I want to build a fitness app with workout tracking',
    'Make a gym management app like Mindbody',
  ],
};
