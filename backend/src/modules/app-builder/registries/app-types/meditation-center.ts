/**
 * Meditation Center App Type Definition
 *
 * Complete definition for meditation center and mindfulness studio applications.
 * Essential for meditation studios, mindfulness centers, and retreat spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDITATION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'meditation-center',
  name: 'Meditation Center',
  category: 'wellness',
  description: 'Meditation center platform with class scheduling, teacher management, retreats, and membership tracking',
  icon: 'lotus',

  keywords: [
    'meditation center',
    'meditation studio',
    'meditation software',
    'meditation classes',
    'mindfulness center',
    'meditation scheduling',
    'meditation retreats',
    'meditation teachers',
    'meditation booking',
    'zen center',
    'dharma center',
    'meditation practice',
    'guided meditation',
    'meditation workshops',
    'mindfulness studio',
    'meditation memberships',
    'meditation groups',
    'meditation space',
    'meditation business',
    'wellness meditation',
  ],

  synonyms: [
    'meditation center platform',
    'meditation center software',
    'meditation studio software',
    'meditation booking software',
    'mindfulness center software',
    'meditation scheduling software',
    'meditation class software',
    'meditation retreat software',
    'meditation membership software',
    'meditation management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'meditation app personal'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and retreats' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'teacher', layout: 'admin', description: 'Schedule and members' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'teacher', name: 'Teacher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Assistant', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/members' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'subscriptions',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'media',
    'reservations',
    'documents',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build a meditation center platform',
    'Create a mindfulness studio app',
    'I need a meditation class scheduling system',
    'Build a meditation retreat booking app',
    'Create a zen center management app',
  ],
};
