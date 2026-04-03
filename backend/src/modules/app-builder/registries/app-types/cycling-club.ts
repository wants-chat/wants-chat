/**
 * Cycling Club App Type Definition
 *
 * Complete definition for cycling clubs and bike riding groups.
 * Essential for cycling teams, bike clubs, and group ride organizers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CYCLING_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'cycling-club',
  name: 'Cycling Club',
  category: 'sports',
  description: 'Cycling club platform with group ride scheduling, route planning, membership management, and performance tracking',
  icon: 'bike',

  keywords: [
    'cycling club',
    'bike club',
    'cycling club software',
    'cycling team',
    'group rides',
    'cycling club management',
    'ride scheduling',
    'cycling club practice',
    'cycling club scheduling',
    'route planning',
    'cycling club crm',
    'racing team',
    'cycling club business',
    'century rides',
    'cycling club pos',
    'training rides',
    'cycling club operations',
    'strava club',
    'cycling club services',
    'road cycling',
  ],

  synonyms: [
    'cycling club platform',
    'cycling club software',
    'bike club software',
    'cycling team software',
    'group rides software',
    'ride scheduling software',
    'cycling club practice software',
    'route planning software',
    'racing team software',
    'road cycling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rides and routes' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and rides' },
  ],

  roles: [
    { id: 'admin', name: 'Club President', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'captain', name: 'Ride Captain', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/rides' },
    { id: 'leader', name: 'Group Leader', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'member', name: 'Cyclist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'group-training',
    'workout-tracking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'trainer-booking',
    'fitness-challenges',
    'body-measurements',
    'nutrition-tracking',
    'equipment-booking',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a cycling club platform',
    'Create a bike club portal',
    'I need a cycling team management system',
    'Build a group ride organizing platform',
    'Create a route planning and ride scheduling app',
  ],
};
