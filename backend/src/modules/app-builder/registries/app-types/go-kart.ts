/**
 * Go-Kart Racing App Type Definition
 *
 * Complete definition for go-kart racing and indoor karting applications.
 * Essential for go-kart tracks, racing facilities, and motorsport entertainment.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GO_KART_APP_TYPE: AppTypeDefinition = {
  id: 'go-kart',
  name: 'Go-Kart Racing',
  category: 'entertainment',
  description: 'Go-kart racing platform with session booking, lap timing, leaderboards, and racing events',
  icon: 'car',

  keywords: [
    'go kart',
    'go karting',
    'kart racing',
    'indoor karting',
    'outdoor karting',
    'k1 speed',
    'andretti indoor karting',
    'rpm raceway',
    'racing',
    'lap times',
    'race track',
    'kart track',
    'electric karts',
    'racing league',
    'racing party',
    'racing event',
    'motorsport',
    'racing birthday',
    'corporate racing',
    'racing championship',
    'speed racing',
    'kart rental',
  ],

  synonyms: [
    'go kart platform',
    'karting software',
    'go kart booking',
    'racing track software',
    'kart racing management',
    'go kart business app',
    'racing facility software',
    'kart track management',
    'racing entertainment app',
    'go kart scheduling',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Racer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book races and view lap times' },
    { id: 'admin', name: 'Track Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Track operations and timing' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Track Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'marshall', name: 'Race Marshall', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/track' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'racer', name: 'Racer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-races' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['course-management', 'inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a go-kart racing booking platform',
    'Create an indoor karting management app',
    'I need a racing track lap timing system',
    'Build a go-kart facility like K1 Speed',
    'Create a karting leaderboard system',
  ],
};
