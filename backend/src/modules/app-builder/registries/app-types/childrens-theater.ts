/**
 * Children's Theater App Type Definition
 *
 * Complete definition for children's theater operations.
 * Essential for youth theater companies, drama schools, and performing arts for kids.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHILDRENS_THEATER_APP_TYPE: AppTypeDefinition = {
  id: 'childrens-theater',
  name: "Children's Theater",
  category: 'entertainment',
  description: "Children's theater platform with audition management, rehearsal scheduling, ticket sales, and cast communication",
  icon: 'theater',

  keywords: [
    'childrens theater',
    'youth theater',
    'childrens theater software',
    'drama school',
    'performing arts kids',
    'childrens theater management',
    'audition management',
    'childrens theater practice',
    'childrens theater scheduling',
    'rehearsal scheduling',
    'childrens theater crm',
    'ticket sales',
    'childrens theater business',
    'cast communication',
    'childrens theater pos',
    'kids musicals',
    'childrens theater operations',
    'drama classes',
    'childrens theater platform',
    'acting workshops',
  ],

  synonyms: [
    'childrens theater platform',
    'childrens theater software',
    'youth theater software',
    'drama school software',
    'performing arts kids software',
    'audition management software',
    'childrens theater practice software',
    'rehearsal scheduling software',
    'ticket sales software',
    'kids musicals software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Audience Portal', enabled: true, basePath: '/', layout: 'public', description: 'Shows and classes' },
    { id: 'admin', name: 'Theater Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Productions and students' },
  ],

  roles: [
    { id: 'admin', name: 'Artistic Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Production Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/productions' },
    { id: 'instructor', name: 'Drama Teacher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'parent', name: 'Parent/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'box-office',
    'show-scheduling',
    'performer-profiles',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'seating-charts',
    'season-passes',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'theatrical',

  examplePrompts: [
    "Build a children's theater platform",
    'Create a youth theater app',
    'I need a drama school system',
    'Build a kids performing arts app',
    "Create a children's theater portal",
  ],
};
