/**
 * Yoga Studio App Type Definition
 *
 * Complete definition for yoga studio and wellness center applications.
 * Essential for yoga studios, meditation centers, and wellness instructors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-studio',
  name: 'Yoga Studio',
  category: 'fitness',
  description: 'Yoga studio platform with class scheduling, membership management, teacher booking, and retreat planning',
  icon: 'spa',

  keywords: [
    'yoga studio',
    'yoga classes',
    'yoga teacher',
    'yoga instructor',
    'hot yoga',
    'vinyasa',
    'hatha yoga',
    'yin yoga',
    'power yoga',
    'bikram',
    'yoga retreat',
    'meditation class',
    'wellness studio',
    'mindbody',
    'classpass',
    'yoga workshop',
    'yoga training',
    'teacher training',
    'yoga therapy',
    'prenatal yoga',
    'restorative yoga',
    'yoga membership',
  ],

  synonyms: [
    'yoga studio platform',
    'yoga class management',
    'yoga booking system',
    'yoga studio software',
    'wellness center app',
    'yoga scheduling',
    'yoga membership app',
    'yoga studio app',
    'mindfulness platform',
    'yoga class booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Class booking and memberships' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Studio management and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'teacher', name: 'Yoga Teacher', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/classes' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'group-training',
    'body-measurements',
    'nutrition-tracking',
    'fitness-challenges',
    'waitlist',
    'media',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a yoga studio booking platform',
    'Create a yoga class management app',
    'I need a yoga studio membership system',
    'Build a wellness studio scheduling software',
    'Create a yoga studio app like MindBody',
  ],
};
