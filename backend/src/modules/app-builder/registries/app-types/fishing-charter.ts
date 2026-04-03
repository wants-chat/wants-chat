/**
 * Fishing Charter App Type Definition
 *
 * Complete definition for fishing charter and guide service applications.
 * Essential for fishing charters, guide services, and outdoor adventures.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FISHING_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'fishing-charter',
  name: 'Fishing Charter',
  category: 'tourism',
  description: 'Fishing charter platform with trip booking, captain profiles, catch reports, and equipment rentals',
  icon: 'fish',

  keywords: [
    'fishing charter',
    'fishing guide',
    'deep sea fishing',
    'fishing trip',
    'fishinbooker',
    'fishingbooker',
    'charter boat',
    'sport fishing',
    'offshore fishing',
    'inshore fishing',
    'fly fishing guide',
    'bass fishing',
    'salmon fishing',
    'fishing captain',
    'fishing excursion',
    'fishing tours',
    'fishing adventure',
    'fishing vacation',
    'fishing package',
    'catch and release',
    'fishing equipment',
    'fishing license',
  ],

  synonyms: [
    'fishing charter platform',
    'fishing charter software',
    'fishing guide software',
    'charter booking system',
    'fishing trip booking',
    'fishing guide app',
    'charter boat software',
    'fishing reservation',
    'guide service software',
    'fishing booking app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find charters and book trips' },
    { id: 'admin', name: 'Captain Dashboard', enabled: true, basePath: '/admin', requiredRole: 'captain', layout: 'admin', description: 'Manage trips and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'captain', name: 'Captain', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/trips' },
    { id: 'mate', name: 'First Mate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'tourism',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a fishing charter booking platform',
    'Create a fishing guide service app',
    'I need a charter boat reservation system',
    'Build a fishing charter like FishingBooker',
    'Create a fishing trip booking app',
  ],
};
