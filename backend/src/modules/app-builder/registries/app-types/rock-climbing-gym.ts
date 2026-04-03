/**
 * Rock Climbing Gym App Type Definition
 *
 * Complete definition for climbing gym operations.
 * Essential for climbing gyms, bouldering centers, and indoor climbing facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROCK_CLIMBING_GYM_APP_TYPE: AppTypeDefinition = {
  id: 'rock-climbing-gym',
  name: 'Rock Climbing Gym',
  category: 'sports',
  description: 'Rock climbing gym platform with membership management, class scheduling, belay certification, and route setting',
  icon: 'mountain',

  keywords: [
    'rock climbing gym',
    'bouldering center',
    'rock climbing gym software',
    'indoor climbing',
    'climbing facility',
    'rock climbing gym management',
    'membership management',
    'rock climbing gym practice',
    'rock climbing gym scheduling',
    'class scheduling',
    'rock climbing gym crm',
    'belay certification',
    'rock climbing gym business',
    'route setting',
    'rock climbing gym pos',
    'lead climbing',
    'rock climbing gym operations',
    'youth climbing',
    'rock climbing gym platform',
    'climbing team',
  ],

  synonyms: [
    'rock climbing gym platform',
    'rock climbing gym software',
    'bouldering center software',
    'indoor climbing software',
    'climbing facility software',
    'membership management software',
    'rock climbing gym practice software',
    'class scheduling software',
    'belay certification software',
    'lead climbing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and climbing' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Gym Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'instructor', name: 'Climbing Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'member', name: 'Climber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'equipment-booking',
    'group-training',
    'fitness-challenges',
    'body-measurements',
    'analytics',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a rock climbing gym platform',
    'Create a bouldering center app',
    'I need a climbing gym management system',
    'Build an indoor climbing facility app',
    'Create a climbing gym portal',
  ],
};
