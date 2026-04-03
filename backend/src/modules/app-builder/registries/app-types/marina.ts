/**
 * Marina & Boat Rental App Type Definition
 *
 * Complete definition for marina and boat rental applications.
 * Essential for marinas, boat rental companies, and waterfront facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARINA_APP_TYPE: AppTypeDefinition = {
  id: 'marina',
  name: 'Marina & Boat Rental',
  category: 'hospitality',
  description: 'Marina platform with slip reservations, boat rentals, fuel dock, and waterfront amenities',
  icon: 'anchor',

  keywords: [
    'marina',
    'boat rental',
    'boat slip',
    'dock rental',
    'yacht club',
    'boat club',
    'boatsetter',
    'getmyboat',
    'click&boat',
    'pontoon rental',
    'jet ski rental',
    'kayak rental',
    'boat storage',
    'dry dock',
    'fuel dock',
    'boat launch',
    'sailing',
    'watercraft',
    'houseboat',
    'charter boat',
    'boat maintenance',
    'marine services',
  ],

  synonyms: [
    'marina platform',
    'marina software',
    'boat rental software',
    'marina management',
    'boat rental app',
    'slip reservation system',
    'marina booking',
    'boat rental platform',
    'watercraft rental',
    'dock management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rent boats and reserve slips' },
    { id: 'admin', name: 'Marina Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Marina operations and fleet' },
  ],

  roles: [
    { id: 'admin', name: 'Marina Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Harbor Master', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/slips' },
    { id: 'staff', name: 'Dock Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'member', name: 'Member', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/my-slip' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a marina management platform',
    'Create a boat rental app like GetMyBoat',
    'I need a slip reservation system',
    'Build a watercraft rental platform',
    'Create a marina booking software',
  ],
};
