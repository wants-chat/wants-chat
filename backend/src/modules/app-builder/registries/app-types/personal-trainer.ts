/**
 * Personal Trainer App Type Definition
 *
 * Complete definition for personal training services.
 * Essential for personal trainers, fitness coaches, and athletic training.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_TRAINER_APP_TYPE: AppTypeDefinition = {
  id: 'personal-trainer',
  name: 'Personal Trainer',
  category: 'personal-services',
  description: 'Personal training platform with client management, workout programming, progress tracking, and session scheduling',
  icon: 'dumbbell',

  keywords: [
    'personal trainer',
    'fitness coaching',
    'personal trainer software',
    'workout programming',
    'athletic training',
    'personal trainer management',
    'client management',
    'personal trainer practice',
    'personal trainer scheduling',
    'progress tracking',
    'personal trainer crm',
    'strength training',
    'personal trainer business',
    'nutrition coaching',
    'personal trainer pos',
    'body transformation',
    'personal trainer operations',
    'online training',
    'personal trainer platform',
    'fitness assessment',
  ],

  synonyms: [
    'personal trainer platform',
    'personal trainer software',
    'fitness coaching software',
    'workout programming software',
    'athletic training software',
    'client management software',
    'personal trainer practice software',
    'progress tracking software',
    'strength training software',
    'online training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Workouts and progress' },
    { id: 'admin', name: 'Trainer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'trainer', name: 'Head Trainer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'staff', name: 'Assistant Trainer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'trainer-booking',
    'workout-tracking',
    'body-measurements',
    'nutrition-tracking',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-scheduling',
    'membership-plans',
    'fitness-challenges',
    'group-training',
    'class-packages',
    'analytics',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a personal trainer platform',
    'Create a fitness coaching portal',
    'I need a workout programming system',
    'Build a client management platform for trainers',
    'Create a progress tracking and scheduling app',
  ],
};
