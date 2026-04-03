/**
 * Boxing Gym App Type Definition
 *
 * Complete definition for boxing gyms and combat sports facilities.
 * Essential for boxing clubs, MMA gyms, and combat sports training centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOXING_GYM_APP_TYPE: AppTypeDefinition = {
  id: 'boxing-gym',
  name: 'Boxing Gym',
  category: 'sports',
  description: 'Boxing gym platform with class scheduling, fighter profiles, sparring management, and competition tracking',
  icon: 'boxing-glove',

  keywords: [
    'boxing gym',
    'fight club',
    'boxing gym software',
    'MMA gym',
    'combat sports',
    'boxing gym management',
    'sparring sessions',
    'boxing gym practice',
    'boxing gym scheduling',
    'boxing classes',
    'boxing gym crm',
    'fighter training',
    'boxing gym business',
    'ring time',
    'boxing gym pos',
    'kickboxing',
    'boxing gym operations',
    'competition prep',
    'boxing gym services',
    'combat training',
  ],

  synonyms: [
    'boxing gym platform',
    'boxing gym software',
    'fight club software',
    'MMA gym software',
    'combat sports software',
    'sparring sessions software',
    'boxing gym practice software',
    'boxing classes software',
    'fighter training software',
    'combat training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and training' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and schedules' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'trainer', name: 'Head Trainer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'coach', name: 'Boxing Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/members' },
    { id: 'member', name: 'Fighter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'workout-tracking',
    'group-training',
    'check-in',
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
    'analytics',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a boxing gym platform',
    'Create a combat sports training portal',
    'I need a boxing gym management system',
    'Build a fight gym business platform',
    'Create a sparring and class scheduling app',
  ],
};
