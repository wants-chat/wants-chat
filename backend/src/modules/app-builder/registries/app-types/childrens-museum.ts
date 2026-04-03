/**
 * Children's Museum App Type Definition
 *
 * Complete definition for children's museum operations.
 * Essential for children's museums, discovery centers, and hands-on science museums.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHILDRENS_MUSEUM_APP_TYPE: AppTypeDefinition = {
  id: 'childrens-museum',
  name: "Children's Museum",
  category: 'entertainment',
  description: "Children's museum platform with exhibit management, membership tracking, event scheduling, and field trip booking",
  icon: 'castle',

  keywords: [
    'childrens museum',
    'discovery center',
    'childrens museum software',
    'hands on museum',
    'science museum',
    'childrens museum management',
    'exhibit management',
    'childrens museum practice',
    'childrens museum scheduling',
    'membership tracking',
    'childrens museum crm',
    'event scheduling',
    'childrens museum business',
    'field trip booking',
    'childrens museum pos',
    'interactive exhibits',
    'childrens museum operations',
    'birthday parties',
    'childrens museum platform',
    'stem learning',
  ],

  synonyms: [
    'childrens museum platform',
    'childrens museum software',
    'discovery center software',
    'hands on museum software',
    'science museum software',
    'exhibit management software',
    'childrens museum practice software',
    'membership tracking software',
    'event scheduling software',
    'interactive exhibits software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Exhibits and events' },
    { id: 'admin', name: 'Museum Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Visitors and exhibits' },
  ],

  roles: [
    { id: 'admin', name: 'Museum Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Exhibit Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/exhibits' },
    { id: 'staff', name: 'Museum Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visitors' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'rainbow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    "Build a children's museum platform",
    'Create a discovery center app',
    'I need a hands-on museum system',
    'Build a science museum for kids app',
    "Create a children's museum portal",
  ],
};
