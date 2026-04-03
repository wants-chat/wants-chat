/**
 * Swim Academy App Type Definition
 *
 * Complete definition for swim school and aquatics academy operations.
 * Essential for swim schools, aquatic centers, and water safety programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIM_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'swim-academy',
  name: 'Swim Academy',
  category: 'education',
  description: 'Swim academy platform with level progression, class scheduling, skill assessments, and pool lane management',
  icon: 'waves',

  keywords: [
    'swim academy',
    'swim school',
    'swim academy software',
    'aquatics',
    'water safety',
    'swim academy management',
    'level progression',
    'swim academy practice',
    'swim academy scheduling',
    'class scheduling',
    'swim academy crm',
    'skill assessments',
    'swim academy business',
    'pool lane',
    'swim academy pos',
    'swim lessons',
    'swim academy operations',
    'competitive swim',
    'swim academy platform',
    'lifeguard training',
  ],

  synonyms: [
    'swim academy platform',
    'swim academy software',
    'swim school software',
    'aquatics software',
    'water safety software',
    'level progression software',
    'swim academy practice software',
    'class scheduling software',
    'skill assessments software',
    'competitive swim software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and progress' },
    { id: 'admin', name: 'Academy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and swimmers' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Swim Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'lifeguard', name: 'Lifeguard', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pool' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'fitness-challenges',
    'body-measurements',
    'equipment-booking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a swim academy platform',
    'Create a swim school portal',
    'I need a swim lesson management system',
    'Build a skill progression platform',
    'Create a pool scheduling app',
  ],
};
