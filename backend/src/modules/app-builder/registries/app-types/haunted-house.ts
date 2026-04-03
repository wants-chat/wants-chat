/**
 * Haunted House App Type Definition
 *
 * Complete definition for haunted attraction operations.
 * Essential for haunted houses, scare attractions, and horror experiences.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAUNTED_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'haunted-house',
  name: 'Haunted House',
  category: 'entertainment',
  description: 'Haunted house platform with timed ticket sales, scare actor scheduling, queue management, and seasonal operations',
  icon: 'ghost',

  keywords: [
    'haunted house',
    'scare attraction',
    'haunted house software',
    'horror experience',
    'halloween event',
    'haunted house management',
    'timed tickets',
    'haunted house practice',
    'haunted house scheduling',
    'scare actor',
    'haunted house crm',
    'queue management',
    'haunted house business',
    'seasonal operations',
    'haunted house pos',
    'escape haunt',
    'haunted house operations',
    'dark attraction',
    'haunted house platform',
    'immersive horror',
  ],

  synonyms: [
    'haunted house platform',
    'haunted house software',
    'scare attraction software',
    'horror experience software',
    'halloween event software',
    'timed tickets software',
    'haunted house practice software',
    'scare actor software',
    'queue management software',
    'escape haunt software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and times' },
    { id: 'admin', name: 'Haunt Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Actors and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Haunt Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Show Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'actor', name: 'Scare Actor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shifts' },
    { id: 'customer', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'show-scheduling',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
    'season-passes',
    'backstage-access',
    'box-office',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'dark',

  examplePrompts: [
    'Build a haunted house platform',
    'Create a scare attraction portal',
    'I need a horror experience system',
    'Build a timed ticket platform',
    'Create a haunted event app',
  ],
};
