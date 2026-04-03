/**
 * Zoo & Aquarium App Type Definition
 *
 * Complete definition for zoo, aquarium, and wildlife park applications.
 * Essential for zoos, aquariums, wildlife sanctuaries, and nature centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZOO_APP_TYPE: AppTypeDefinition = {
  id: 'zoo',
  name: 'Zoo & Aquarium',
  category: 'entertainment',
  description: 'Zoo and aquarium platform with ticketing, animal encounters, education programs, and conservation support',
  icon: 'paw',

  keywords: [
    'zoo',
    'aquarium',
    'wildlife park',
    'animal park',
    'safari park',
    'nature center',
    'wildlife sanctuary',
    'san diego zoo',
    'seaworld',
    'shedd aquarium',
    'animal exhibits',
    'animal encounters',
    'feeding experience',
    'zoo membership',
    'conservation',
    'endangered species',
    'zoo education',
    'school trips',
    'zoo camp',
    'behind the scenes',
    'adopt an animal',
    'zoo events',
  ],

  synonyms: [
    'zoo platform',
    'aquarium software',
    'wildlife park software',
    'zoo ticketing system',
    'aquarium management',
    'zoo app',
    'animal park software',
    'zoo booking system',
    'aquarium ticketing',
    'wildlife management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy tickets and plan visit' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Zoo operations and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'keeper', name: 'Animal Keeper', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/animals' },
    { id: 'educator', name: 'Educator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'visitor', name: 'Visitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'ticket-sales',
    'season-passes',
    'show-scheduling',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'analytics',
    'venue-booking',
    'backstage-access',
    'box-office',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'nature',

  examplePrompts: [
    'Build a zoo ticketing platform',
    'Create an aquarium visitor app',
    'I need a wildlife park management system',
    'Build a zoo membership and donations platform',
    'Create an aquarium education booking system',
  ],
};
