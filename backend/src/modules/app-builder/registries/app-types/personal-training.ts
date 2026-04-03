/**
 * Personal Training App Type Definition
 *
 * Complete definition for personal training and coaching applications.
 * Essential for personal trainers, fitness coaches, and wellness professionals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'personal-training',
  name: 'Personal Training',
  category: 'fitness',
  description: 'Personal training platform with client management, workout plans, progress tracking, and session booking',
  icon: 'dumbbell',

  keywords: [
    'personal training',
    'personal trainer',
    'fitness coaching',
    'pt',
    'one on one training',
    'trainerize',
    'truecoach',
    'my pt hub',
    'online coaching',
    'fitness trainer',
    'strength training',
    'workout plans',
    'fitness programming',
    'client management',
    'exercise coaching',
    'fitness goals',
    'nutrition coaching',
    'body transformation',
    'fitness accountability',
    'virtual training',
    'in-home training',
    'bootcamp',
  ],

  synonyms: [
    'personal training platform',
    'fitness coaching software',
    'trainer app',
    'personal trainer software',
    'coaching platform',
    'fitness trainer app',
    'pt management',
    'training software',
    'workout coaching',
    'fitness coaching app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Client access and workout tracking' },
    { id: 'admin', name: 'Trainer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'trainer', layout: 'admin', description: 'Client and program management' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'trainer', name: 'Personal Trainer', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/workouts' },
  ],

  defaultFeatures: [
    'user-auth',
    'trainer-booking',
    'workout-tracking',
    'body-measurements',
    'nutrition-tracking',
    'messaging',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'class-scheduling',
    'membership-plans',
    'fitness-challenges',
    'group-training',
    'class-packages',
    'analytics',
    'media',
    'gallery',
  ],

  incompatibleFeatures: ['shopping-cart', 'table-reservations', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'energetic',

  examplePrompts: [
    'Build a personal training platform',
    'Create a fitness coaching app like Trainerize',
    'I need a personal trainer client management system',
    'Build a workout programming app for trainers',
    'Create an online coaching platform for fitness',
  ],
};
