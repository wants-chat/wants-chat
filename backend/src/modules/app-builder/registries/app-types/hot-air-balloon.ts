/**
 * Hot Air Balloon App Type Definition
 *
 * Complete definition for hot air balloon ride operations.
 * Essential for balloon ride operators, aerial adventures, and scenic flights.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOT_AIR_BALLOON_APP_TYPE: AppTypeDefinition = {
  id: 'hot-air-balloon',
  name: 'Hot Air Balloon',
  category: 'entertainment',
  description: 'Hot air balloon platform with flight booking, weather monitoring, pilot scheduling, and chase crew coordination',
  icon: 'sunrise',

  keywords: [
    'hot air balloon',
    'balloon ride',
    'hot air balloon software',
    'aerial adventure',
    'scenic flight',
    'hot air balloon management',
    'flight booking',
    'hot air balloon practice',
    'hot air balloon scheduling',
    'weather monitoring',
    'hot air balloon crm',
    'pilot scheduling',
    'hot air balloon business',
    'chase crew',
    'hot air balloon pos',
    'sunrise flight',
    'hot air balloon operations',
    'sunset flight',
    'hot air balloon platform',
    'champagne toast',
  ],

  synonyms: [
    'hot air balloon platform',
    'hot air balloon software',
    'balloon ride software',
    'aerial adventure software',
    'scenic flight software',
    'flight booking software',
    'hot air balloon practice software',
    'weather monitoring software',
    'pilot scheduling software',
    'sunrise flight software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Flights and booking' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Weather and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pilot', name: 'Balloon Pilot', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/flights' },
    { id: 'crew', name: 'Chase Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Passenger', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a hot air balloon platform',
    'Create a balloon ride portal',
    'I need an aerial adventure system',
    'Build a scenic flight booking platform',
    'Create a balloon tour app',
  ],
};
