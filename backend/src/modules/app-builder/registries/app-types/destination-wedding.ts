/**
 * Destination Wedding App Type Definition
 *
 * Complete definition for destination wedding and travel wedding applications.
 * Essential for destination wedding planners, resorts, and travel coordinators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DESTINATION_WEDDING_APP_TYPE: AppTypeDefinition = {
  id: 'destination-wedding',
  name: 'Destination Wedding',
  category: 'travel',
  description: 'Destination wedding platform with venue booking, travel coordination, guest management, and vendor coordination',
  icon: 'heart',

  keywords: [
    'destination wedding',
    'destination wedding planner',
    'travel wedding',
    'destination wedding software',
    'wedding travel',
    'resort wedding',
    'beach wedding',
    'destination wedding venue',
    'wedding destination',
    'destination wedding coordinator',
    'destination wedding booking',
    'wedding travel planning',
    'destination wedding packages',
    'wedding abroad',
    'elopement destination',
    'destination wedding guests',
    'wedding travel agency',
    'destination wedding business',
    'tropical wedding',
    'international wedding',
  ],

  synonyms: [
    'destination wedding platform',
    'destination wedding software',
    'wedding travel software',
    'destination wedding planner software',
    'resort wedding software',
    'wedding destination software',
    'wedding travel planning software',
    'destination wedding booking software',
    'wedding abroad software',
    'elopement planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'wedding venue local'],

  sections: [
    { id: 'frontend', name: 'Couple Portal', enabled: true, basePath: '/', layout: 'public', description: 'Destinations and planning' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Weddings and travel' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Wedding Planner', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/weddings' },
    { id: 'coordinator', name: 'Travel Coordinator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'couple', name: 'Couple', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a destination wedding platform',
    'Create a wedding travel planning app',
    'I need a destination wedding coordinator system',
    'Build a resort wedding booking app',
    'Create a destination wedding planner platform',
  ],
};
