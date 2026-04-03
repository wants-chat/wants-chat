/**
 * Arcade App Type Definition
 *
 * Complete definition for arcade and gaming center applications.
 * Essential for arcades, barcades, and family entertainment centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARCADE_APP_TYPE: AppTypeDefinition = {
  id: 'arcade',
  name: 'Arcade',
  category: 'entertainment',
  description: 'Arcade platform with game card management, prize redemption, party booking, and loyalty rewards',
  icon: 'gamepad',

  keywords: [
    'arcade',
    'arcade games',
    'video arcade',
    'barcade',
    'dave and busters',
    'chuck e cheese',
    'round1',
    'main event',
    'game room',
    'arcade tokens',
    'game cards',
    'arcade prizes',
    'ticket redemption',
    'claw machine',
    'arcade birthday',
    'arcade party',
    'retro arcade',
    'pinball',
    'racing games',
    'vr arcade',
    'family arcade',
    'arcade credits',
  ],

  synonyms: [
    'arcade platform',
    'arcade software',
    'game card system',
    'arcade management',
    'barcade software',
    'arcade business app',
    'arcade party booking',
    'game center software',
    'arcade redemption',
    'arcade booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy credits and check rewards' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and prize management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/games' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/redemption' },
    { id: 'technician', name: 'Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/maintenance' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'ticket-sales',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'season-passes',
    'venue-booking',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build an arcade management platform',
    'Create an arcade game card system',
    'I need an arcade prize redemption software',
    'Build an arcade like Dave and Busters',
    'Create a barcade management app',
  ],
};
