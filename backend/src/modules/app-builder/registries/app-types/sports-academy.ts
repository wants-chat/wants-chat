/**
 * Sports Academy App Type Definition
 *
 * Complete definition for sports academy and training facility operations.
 * Essential for sports academies, athletic training centers, and youth sports programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'sports-academy',
  name: 'Sports Academy',
  category: 'education',
  description: 'Sports academy platform with training programs, athlete development, camp registration, and performance tracking',
  icon: 'medal',

  keywords: [
    'sports academy',
    'athletic training',
    'sports academy software',
    'youth sports',
    'sports training',
    'sports academy management',
    'training programs',
    'sports academy practice',
    'sports academy scheduling',
    'athlete development',
    'sports academy crm',
    'camp registration',
    'sports academy business',
    'performance tracking',
    'sports academy pos',
    'basketball academy',
    'sports academy operations',
    'soccer academy',
    'sports academy platform',
    'baseball training',
  ],

  synonyms: [
    'sports academy platform',
    'sports academy software',
    'athletic training software',
    'youth sports software',
    'sports training software',
    'training programs software',
    'sports academy practice software',
    'athlete development software',
    'camp registration software',
    'performance tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Athlete Portal', enabled: true, basePath: '/', layout: 'public', description: 'Training and camps' },
    { id: 'admin', name: 'Academy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Programs and athletes' },
  ],

  roles: [
    { id: 'admin', name: 'Academy Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Head Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'trainer', name: 'Trainer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'athlete', name: 'Athlete/Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'workout-tracking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'body-measurements',
    'fitness-challenges',
    'group-training',
    'class-packages',
    'equipment-booking',
    'nutrition-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a sports academy platform',
    'Create an athletic training portal',
    'I need a sports camp management system',
    'Build an athlete development platform',
    'Create a training registration app',
  ],
};
