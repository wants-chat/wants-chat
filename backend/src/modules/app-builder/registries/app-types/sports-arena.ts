/**
 * Sports Arena App Type Definition
 *
 * Complete definition for sports arenas and stadium applications.
 * Essential for stadiums, arenas, and sports complexes.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_ARENA_APP_TYPE: AppTypeDefinition = {
  id: 'sports-arena',
  name: 'Sports Arena',
  category: 'entertainment',
  description: 'Sports arena platform with ticket sales, suite rentals, concessions, and event management',
  icon: 'trophy',

  keywords: [
    'sports arena',
    'stadium management',
    'arena software',
    'sports ticketing',
    'suite rentals',
    'stadium booking',
    'arena events',
    'sports venue',
    'stadium pos',
    'arena concessions',
    'sports complex',
    'stadium crm',
    'arena scheduling',
    'sports facility',
    'stadium management',
    'arena ticketing',
    'game day',
    'stadium business',
    'arena operations',
    'sports venue management',
  ],

  synonyms: [
    'sports arena platform',
    'sports arena software',
    'stadium management software',
    'arena ticketing software',
    'sports venue software',
    'stadium booking software',
    'arena event software',
    'sports complex software',
    'stadium operations software',
    'arena management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home gym'],

  sections: [
    { id: 'frontend', name: 'Fan Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and events' },
    { id: 'admin', name: 'Arena Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Arena Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/operations' },
    { id: 'vendor', name: 'Vendor', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/concessions' },
    { id: 'fan', name: 'Fan', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'seating-charts',
    'box-office',
    'show-scheduling',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'performer-profiles',
    'season-passes',
    'backstage-access',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a sports arena ticketing platform',
    'Create a stadium management app',
    'I need an arena event system',
    'Build a sports venue booking platform',
    'Create a stadium operations app',
  ],
};
