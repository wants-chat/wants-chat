/**
 * Wellness Retreat App Type Definition
 *
 * Complete definition for wellness retreat and healing center applications.
 * Essential for retreat centers, wellness resorts, and healing retreats.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELLNESS_RETREAT_APP_TYPE: AppTypeDefinition = {
  id: 'wellness-retreat',
  name: 'Wellness Retreat',
  category: 'wellness',
  description: 'Wellness retreat platform with program booking, accommodation, activity scheduling, and guest management',
  icon: 'sun',

  keywords: [
    'wellness retreat',
    'retreat center',
    'wellness resort',
    'healing retreat',
    'retreat software',
    'retreat booking',
    'wellness programs',
    'retreat management',
    'yoga retreat',
    'detox retreat',
    'spiritual retreat',
    'health retreat',
    'wellness vacation',
    'retreat scheduling',
    'wellness getaway',
    'retreat accommodations',
    'wellness sanctuary',
    'retreat business',
    'holistic retreat',
    'wellness escape',
  ],

  synonyms: [
    'wellness retreat platform',
    'wellness retreat software',
    'retreat center software',
    'retreat booking software',
    'wellness resort software',
    'healing retreat software',
    'retreat management software',
    'retreat scheduling software',
    'wellness program software',
    'retreat accommodation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'corporate retreat'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and booking' },
    { id: 'admin', name: 'Retreat Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Guests and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Retreat Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Retreat Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'coordinator', name: 'Program Coordinator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'facilitator', name: 'Facilitator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'group-training',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'body-measurements',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'workout-tracking',
    'discounts',
    'waitlist',
    'gallery',
    'reservations',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'wellness',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a wellness retreat booking platform',
    'Create a retreat center management app',
    'I need a wellness resort booking system',
    'Build a healing retreat app',
    'Create a wellness program booking platform',
  ],
};
