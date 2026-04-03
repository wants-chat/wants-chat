/**
 * Triathlon Club App Type Definition
 *
 * Complete definition for triathlon clubs and multisport training.
 * Essential for triathlon teams, endurance clubs, and multisport coaching.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRIATHLON_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'triathlon-club',
  name: 'Triathlon Club',
  category: 'sports',
  description: 'Triathlon club platform with training plans, race registration, workout logging, and multisport coaching',
  icon: 'trophy',

  keywords: [
    'triathlon club',
    'multisport training',
    'triathlon club software',
    'endurance sports',
    'triathlon team',
    'triathlon club management',
    'training plans',
    'triathlon club practice',
    'triathlon club scheduling',
    'race registration',
    'triathlon club crm',
    'swim-bike-run',
    'triathlon club business',
    'workout logging',
    'triathlon club pos',
    'ironman training',
    'triathlon club operations',
    'transition practice',
    'triathlon club services',
    'endurance coaching',
  ],

  synonyms: [
    'triathlon club platform',
    'triathlon club software',
    'multisport training software',
    'endurance sports software',
    'triathlon team software',
    'training plans software',
    'triathlon club practice software',
    'race registration software',
    'workout logging software',
    'endurance coaching software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Athlete Portal', enabled: true, basePath: '/', layout: 'public', description: 'Training and races' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Athletes and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Club Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Head Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/training' },
    { id: 'mentor', name: 'Mentor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/athletes' },
    { id: 'athlete', name: 'Triathlete', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'workout-tracking',
    'group-training',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'body-measurements',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'equipment-booking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a triathlon club platform',
    'Create a multisport training portal',
    'I need a triathlon team management system',
    'Build an endurance club platform',
    'Create a training plan and race tracking app',
  ],
};
