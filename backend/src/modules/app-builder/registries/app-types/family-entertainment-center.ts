/**
 * Family Entertainment Center App Type Definition
 *
 * Complete definition for family entertainment center operations.
 * Essential for FECs, amusement centers, and family fun centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FAMILY_ENTERTAINMENT_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'family-entertainment-center',
  name: 'Family Entertainment Center',
  category: 'entertainment',
  description: 'Family entertainment platform with attraction management, party booking, arcade systems, and membership programs',
  icon: 'gamepad',

  keywords: [
    'family entertainment center',
    'fec',
    'family entertainment center software',
    'amusement center',
    'family fun center',
    'family entertainment center management',
    'attraction management',
    'family entertainment center practice',
    'family entertainment center scheduling',
    'party booking',
    'family entertainment center crm',
    'arcade systems',
    'family entertainment center business',
    'membership programs',
    'family entertainment center pos',
    'bowling arcade',
    'family entertainment center operations',
    'laser tag arcade',
    'family entertainment center platform',
    'redemption games',
  ],

  synonyms: [
    'family entertainment center platform',
    'family entertainment center software',
    'fec software',
    'amusement center software',
    'family fun center software',
    'attraction management software',
    'family entertainment center practice software',
    'party booking software',
    'arcade systems software',
    'bowling arcade software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Attractions and parties' },
    { id: 'admin', name: 'FEC Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Guests and operations' },
  ],

  roles: [
    { id: 'admin', name: 'General Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Floor Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/attractions' },
    { id: 'staff', name: 'Team Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/parties' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'season-passes',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'show-scheduling',
    'box-office',
    'backstage-access',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build a family entertainment center platform',
    'Create an FEC management app',
    'I need an amusement center system',
    'Build a family fun center app',
    'Create a family entertainment portal',
  ],
};
