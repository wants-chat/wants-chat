/**
 * Climbing Gym App Type Definition
 *
 * Complete definition for climbing gym and bouldering applications.
 * Essential for climbing gyms, bouldering centers, and outdoor climbing guides.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLIMBING_GYM_APP_TYPE: AppTypeDefinition = {
  id: 'climbing-gym',
  name: 'Climbing Gym',
  category: 'fitness',
  description: 'Climbing gym platform with day passes, memberships, classes, gear rentals, and route tracking',
  icon: 'mountain',

  keywords: [
    'climbing gym',
    'rock climbing',
    'bouldering',
    'indoor climbing',
    'climbing wall',
    'climbing center',
    'movement climbing',
    'earth treks',
    'brooklyn boulders',
    'climbing classes',
    'belay certification',
    'lead climbing',
    'top rope',
    'auto belay',
    'climbing routes',
    'climbing grades',
    'climbing membership',
    'climbing youth',
    'climbing team',
    'climbing competition',
    'climbing gear',
    'climbing shoes',
  ],

  synonyms: [
    'climbing gym platform',
    'climbing gym software',
    'bouldering gym software',
    'climbing center software',
    'climbing membership system',
    'climbing gym app',
    'rock gym software',
    'climbing facility software',
    'bouldering center app',
    'climbing management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'traditional gym'],

  sections: [
    { id: 'frontend', name: 'Climber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy passes and book classes' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and route setting' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Gym Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'setter', name: 'Route Setter', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'instructor', name: 'Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'equipment-booking',
    'group-training',
    'fitness-challenges',
    'body-measurements',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a climbing gym membership platform',
    'Create a bouldering gym booking app',
    'I need a climbing center management system',
    'Build a climbing gym like Movement',
    'Create a rock climbing facility app',
  ],
};
