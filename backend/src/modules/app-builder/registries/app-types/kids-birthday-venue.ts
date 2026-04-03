/**
 * Kids Birthday Venue App Type Definition
 *
 * Complete definition for kids birthday venue operations.
 * Essential for party venues, birthday party centers, and children's event spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_BIRTHDAY_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'kids-birthday-venue',
  name: 'Kids Birthday Venue',
  category: 'entertainment',
  description: 'Kids birthday venue platform with party booking, package management, catering coordination, and entertainment scheduling',
  icon: 'cake',

  keywords: [
    'kids birthday venue',
    'party venue',
    'kids birthday venue software',
    'birthday party center',
    'childrens events',
    'kids birthday venue management',
    'party booking',
    'kids birthday venue practice',
    'kids birthday venue scheduling',
    'package management',
    'kids birthday venue crm',
    'catering coordination',
    'kids birthday venue business',
    'entertainment scheduling',
    'kids birthday venue pos',
    'themed parties',
    'kids birthday venue operations',
    'party packages',
    'kids birthday venue platform',
    'princess parties',
  ],

  synonyms: [
    'kids birthday venue platform',
    'kids birthday venue software',
    'party venue software',
    'birthday party center software',
    'childrens events software',
    'party booking software',
    'kids birthday venue practice software',
    'package management software',
    'catering coordination software',
    'themed parties software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Packages and booking' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Parties and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Venue Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Event Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/parties' },
    { id: 'host', name: 'Party Host', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/today' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'rainbow',
  defaultDesignVariant: 'festive',

  examplePrompts: [
    'Build a kids birthday venue platform',
    'Create a party venue app',
    'I need a birthday party center system',
    "Build a children's event space app",
    'Create a kids birthday venue portal',
  ],
};
