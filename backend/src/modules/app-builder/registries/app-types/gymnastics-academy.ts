/**
 * Gymnastics Academy App Type Definition
 *
 * Complete definition for gymnastics academy and gym operations.
 * Essential for gymnastics gyms, cheerleading academies, and tumbling centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GYMNASTICS_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'gymnastics-academy',
  name: 'Gymnastics Academy',
  category: 'education',
  description: 'Gymnastics academy platform with skill progression, class scheduling, meet management, and equipment tracking',
  icon: 'trophy',

  keywords: [
    'gymnastics academy',
    'gymnastics gym',
    'gymnastics academy software',
    'cheerleading',
    'tumbling',
    'gymnastics academy management',
    'skill progression',
    'gymnastics academy practice',
    'gymnastics academy scheduling',
    'class scheduling',
    'gymnastics academy crm',
    'meet management',
    'gymnastics academy business',
    'equipment tracking',
    'gymnastics academy pos',
    'competitive team',
    'gymnastics academy operations',
    'recreational',
    'gymnastics academy platform',
    'trampoline',
  ],

  synonyms: [
    'gymnastics academy platform',
    'gymnastics academy software',
    'gymnastics gym software',
    'cheerleading software',
    'tumbling software',
    'skill progression software',
    'gymnastics academy practice software',
    'class scheduling software',
    'meet management software',
    'competitive team software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and progress' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Athletes and meets' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Head Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/athletes' },
    { id: 'assistant', name: 'Assistant Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
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
    'workout-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a gymnastics academy platform',
    'Create a gymnastics gym portal',
    'I need a gymnastics management system',
    'Build a skill tracking platform',
    'Create a meet registration app',
  ],
};
