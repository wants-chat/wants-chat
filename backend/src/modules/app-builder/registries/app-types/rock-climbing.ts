/**
 * Rock Climbing App Type Definition
 *
 * Complete definition for rock climbing gym and outdoor climbing.
 * Essential for climbing gyms, outdoor guiding, and climbing instruction.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROCK_CLIMBING_APP_TYPE: AppTypeDefinition = {
  id: 'rock-climbing',
  name: 'Rock Climbing',
  category: 'outdoor',
  description: 'Rock climbing platform with membership management, class booking, route tracking, and gear rentals',
  icon: 'mountain-snow',

  keywords: [
    'rock climbing',
    'climbing gym',
    'rock climbing software',
    'outdoor climbing',
    'bouldering',
    'rock climbing management',
    'membership management',
    'rock climbing practice',
    'rock climbing scheduling',
    'class booking',
    'rock climbing crm',
    'route tracking',
    'rock climbing business',
    'gear rentals',
    'rock climbing pos',
    'belay certification',
    'rock climbing operations',
    'lead climbing',
    'rock climbing platform',
    'climbing instruction',
  ],

  synonyms: [
    'rock climbing platform',
    'rock climbing software',
    'climbing gym software',
    'outdoor climbing software',
    'bouldering software',
    'membership management software',
    'rock climbing practice software',
    'class booking software',
    'route tracking software',
    'climbing instruction software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Climber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and routes' },
    { id: 'admin', name: 'Gym Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Gym Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Gym Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'instructor', name: 'Climbing Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'climber', name: 'Climber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-packages',
    'equipment-booking',
    'group-training',
    'fitness-challenges',
    'body-measurements',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'fitness',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a rock climbing gym platform',
    'Create a climbing class booking portal',
    'I need a climbing membership system',
    'Build a route tracking platform',
    'Create a gear rental and class app',
  ],
};
