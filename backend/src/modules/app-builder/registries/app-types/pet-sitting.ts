/**
 * Pet Sitting & Dog Walking App Type Definition
 *
 * Complete definition for pet care service applications.
 * Essential for pet sitters, dog walkers, and pet care providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_SITTING_APP_TYPE: AppTypeDefinition = {
  id: 'pet-sitting',
  name: 'Pet Sitting & Dog Walking',
  category: 'services',
  description: 'Pet care platform with booking, scheduling, GPS tracking, and photo updates',
  icon: 'dog',

  keywords: [
    'pet sitting',
    'dog walking',
    'pet care',
    'dog sitter',
    'cat sitter',
    'rover',
    'wag',
    'care.com pets',
    'pet boarding',
    'house sitting',
    'pet daycare',
    'dog daycare',
    'pet hotel',
    'dog grooming',
    'pet services',
    'dog walker',
    'overnight pet care',
    'drop in visits',
    'pet taxi',
    'dog training',
    'pet nanny',
    'animal care',
  ],

  synonyms: [
    'pet sitting platform',
    'dog walking app',
    'pet care software',
    'pet sitter marketplace',
    'dog walker app',
    'pet services platform',
    'pet boarding software',
    'pet care booking',
    'dog walking service',
    'pet sitting app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Pet Owner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find and book pet sitters' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin', description: 'Platform management' },
    { id: 'vendor', name: 'Sitter Dashboard', enabled: true, basePath: '/sitter', requiredRole: 'sitter', layout: 'admin', description: 'Booking and schedule management' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'sitter', name: 'Pet Sitter', level: 50, isDefault: false, accessibleSections: ['frontend', 'vendor'], defaultRoute: '/sitter/bookings' },
    { id: 'owner', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/search' },
  ],

  defaultFeatures: [
    'user-auth',
    'messaging',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet sitting platform like Rover',
    'Create a dog walking booking app',
    'I need a pet care services marketplace',
    'Build a pet sitter matching platform',
    'Create a dog walking app with GPS tracking',
  ],
};
