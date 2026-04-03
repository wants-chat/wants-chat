/**
 * Museum App Type Definition
 *
 * Complete definition for museum and gallery applications.
 * Essential for museums, art galleries, science centers, and cultural institutions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSEUM_APP_TYPE: AppTypeDefinition = {
  id: 'museum',
  name: 'Museum',
  category: 'entertainment',
  description: 'Museum platform with ticketing, exhibit information, audio guides, and membership management',
  icon: 'building-columns',

  keywords: [
    'museum',
    'art gallery',
    'science museum',
    'history museum',
    'natural history',
    'smithsonian',
    'metropolitan museum',
    'moma',
    'louvre',
    'exhibits',
    'collections',
    'gallery',
    'museum tour',
    'audio guide',
    'museum membership',
    'museum events',
    'museum education',
    'field trip',
    'museum shop',
    'cultural institution',
    'heritage',
    'artifacts',
  ],

  synonyms: [
    'museum platform',
    'museum software',
    'gallery software',
    'museum ticketing',
    'museum management',
    'cultural institution software',
    'museum app',
    'gallery management',
    'museum booking',
    'exhibit management',
  ],

  negativeKeywords: ['blog only', 'restaurant', 'fitness', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy tickets and explore exhibits' },
    { id: 'admin', name: 'Museum Dashboard', enabled: true, basePath: '/admin', requiredRole: 'curator', layout: 'admin', description: 'Collections and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Curator', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/exhibits' },
    { id: 'educator', name: 'Educator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'member', name: 'Member', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/member' },
    { id: 'visitor', name: 'Visitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'ticket-sales',
    'season-passes',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reservations',
    'analytics',
    'venue-booking',
    'show-scheduling',
    'backstage-access',
    'box-office',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a museum ticketing platform',
    'Create an art gallery visitor app',
    'I need a museum membership system',
    'Build a science museum education booking platform',
    'Create a museum audio guide app',
  ],
};
