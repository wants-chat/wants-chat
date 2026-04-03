/**
 * Science Museum App Type Definition
 *
 * Complete definition for science museum and discovery center operations.
 * Essential for science museums, planetariums, and interactive learning centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCIENCE_MUSEUM_APP_TYPE: AppTypeDefinition = {
  id: 'science-museum',
  name: 'Science Museum',
  category: 'education',
  description: 'Science museum platform with exhibit management, ticket booking, educational programs, and membership management',
  icon: 'atom',

  keywords: [
    'science museum',
    'discovery center',
    'science museum software',
    'planetarium',
    'interactive learning',
    'science museum management',
    'exhibit management',
    'science museum practice',
    'science museum scheduling',
    'ticket booking',
    'science museum crm',
    'educational programs',
    'science museum business',
    'membership management',
    'science museum pos',
    'stem education',
    'science museum operations',
    'field trips',
    'science museum platform',
    'virtual tours',
  ],

  synonyms: [
    'science museum platform',
    'science museum software',
    'discovery center software',
    'planetarium software',
    'interactive learning software',
    'exhibit management software',
    'science museum practice software',
    'ticket booking software',
    'educational programs software',
    'stem education software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Exhibits and tickets' },
    { id: 'admin', name: 'Museum Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Museum Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/exhibits' },
    { id: 'educator', name: 'Educator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'visitor', name: 'Visitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'season-passes',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
    'venue-booking',
    'show-scheduling',
    'box-office',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a science museum platform',
    'Create a discovery center portal',
    'I need a museum management system',
    'Build an exhibit and ticketing platform',
    'Create an educational program app',
  ],
};
