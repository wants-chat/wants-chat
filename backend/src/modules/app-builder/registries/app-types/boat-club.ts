/**
 * Boat Club App Type Definition
 *
 * Complete definition for boat club and shared boating memberships.
 * Essential for boat clubs, fractional ownership, and boating memberships.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'boat-club',
  name: 'Boat Club',
  category: 'marine',
  description: 'Boat club platform with membership management, boat reservations, usage tracking, and training requirements',
  icon: 'ship',

  keywords: [
    'boat club',
    'boating membership',
    'boat club software',
    'shared boating',
    'boat club booking',
    'boat club management',
    'fractional boat',
    'boat club fleet',
    'boat club scheduling',
    'boat timeshare',
    'boat club crm',
    'unlimited boating',
    'boat club business',
    'boat sharing',
    'boat club pos',
    'member boating',
    'boat club operations',
    'recreational boating',
    'boat club services',
    'boating community',
  ],

  synonyms: [
    'boat club platform',
    'boat club software',
    'boating membership software',
    'shared boating software',
    'boat club booking software',
    'fractional boat software',
    'boat club fleet software',
    'boat timeshare software',
    'boat sharing software',
    'member boating software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'car club'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reservations and fleet' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dockmaster', layout: 'admin', description: 'Members and fleet' },
  ],

  roles: [
    { id: 'admin', name: 'Club Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Membership Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'dockmaster', name: 'Dockmaster', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reservations' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'marine',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'premium',

  examplePrompts: [
    'Build a boat club platform',
    'Create a boating membership app',
    'I need a shared boating reservation system',
    'Build a fractional boat ownership platform',
    'Create a boat club management app',
  ],
};
