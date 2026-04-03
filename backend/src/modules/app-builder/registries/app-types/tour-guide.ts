/**
 * Tour Guide App Type Definition
 *
 * Complete definition for tour guide and guided experience applications.
 * Essential for tour guides, walking tours, and experience providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUR_GUIDE_APP_TYPE: AppTypeDefinition = {
  id: 'tour-guide',
  name: 'Tour Guide',
  category: 'travel',
  description: 'Tour guide platform with booking, scheduling, customer management, and tour tracking',
  icon: 'map-pin',

  keywords: [
    'tour guide',
    'guided tours',
    'tour booking',
    'walking tours',
    'tour software',
    'tour scheduling',
    'local guide',
    'city tours',
    'tour experiences',
    'private tours',
    'group tours',
    'tour operator',
    'sightseeing tours',
    'tour business',
    'tour management',
    'tour reservations',
    'tour guide app',
    'tour calendar',
    'experience tours',
    'tour customers',
  ],

  synonyms: [
    'tour guide platform',
    'tour guide software',
    'tour booking software',
    'guided tour software',
    'tour scheduling software',
    'walking tour software',
    'tour management software',
    'tour experience software',
    'local guide software',
    'tour reservation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'audio tour app'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tours and booking' },
    { id: 'admin', name: 'Guide Dashboard', enabled: true, basePath: '/admin', requiredRole: 'guide', layout: 'admin', description: 'Schedule and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'guide', name: 'Tour Guide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tours' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'gallery',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'travel',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a tour guide booking platform',
    'Create a walking tour app',
    'I need a tour scheduling system',
    'Build a local guide booking app',
    'Create a tour experience platform',
  ],
};
