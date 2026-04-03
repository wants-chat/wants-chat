/**
 * Gaming Community App Type Definition
 *
 * Complete definition for gaming community and gamer social platform applications.
 * Essential for gaming communities, clans, guilds, and gamer social networks.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GAMING_COMMUNITY_APP_TYPE: AppTypeDefinition = {
  id: 'gaming-community',
  name: 'Gaming Community',
  category: 'social',
  description: 'Gaming community platform with clan management, matchmaking, events, and gamer profiles',
  icon: 'gamepad-2',

  keywords: [
    'gaming community',
    'gaming platform',
    'gamer social network',
    'clan management',
    'guild management',
    'gaming clan',
    'esports community',
    'lfg',
    'looking for group',
    'gaming matchmaking',
    'gaming events',
    'gamer profiles',
    'gaming discord',
    'gaming forum',
    'game night',
    'multiplayer community',
    'gaming team',
    'gaming hub',
    'gamer connect',
    'gaming social',
    'play together',
  ],

  synonyms: [
    'gaming community platform',
    'gaming community software',
    'gamer social network',
    'clan management software',
    'gaming community app',
    'guild management platform',
    'gaming hub software',
    'gamer platform',
    'gaming social platform',
    'esports community software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Connect and play' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'leader', layout: 'admin', description: 'Community and events' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'leader', name: 'Clan/Guild Leader', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clan' },
    { id: 'officer', name: 'Officer', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/members' },
    { id: 'moderator', name: 'Moderator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/moderation' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'chat',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'calendar',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'dark',

  examplePrompts: [
    'Build a gaming community platform',
    'Create a clan management system',
    'I need a gamer social network',
    'Build a gaming LFG platform',
    'Create a guild management app',
  ],
};
