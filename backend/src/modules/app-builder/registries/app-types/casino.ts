/**
 * Casino App Type Definition
 *
 * Complete definition for casino and gaming resort applications.
 * Essential for casinos, gaming resorts, and gambling establishments.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CASINO_APP_TYPE: AppTypeDefinition = {
  id: 'casino',
  name: 'Casino',
  category: 'entertainment',
  description: 'Casino platform with player tracking, rewards programs, table reservations, and entertainment booking',
  icon: 'sparkles',

  keywords: [
    'casino',
    'gaming resort',
    'casino software',
    'player tracking',
    'casino rewards',
    'table games',
    'casino booking',
    'slot machines',
    'casino management',
    'gaming floor',
    'casino crm',
    'casino marketing',
    'vip gaming',
    'casino pos',
    'casino loyalty',
    'casino scheduling',
    'gaming operations',
    'casino business',
    'high roller',
    'casino entertainment',
  ],

  synonyms: [
    'casino platform',
    'casino software',
    'gaming resort software',
    'casino management software',
    'player tracking software',
    'casino rewards software',
    'gaming floor software',
    'casino crm software',
    'casino loyalty software',
    'casino operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'online gambling'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rewards and reservations' },
    { id: 'admin', name: 'Casino Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Players and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Casino Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/floor' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tables' },
    { id: 'host', name: 'Casino Host', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vip' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a casino rewards platform',
    'Create a gaming resort management app',
    'I need a casino player tracking system',
    'Build a casino VIP management platform',
    'Create a casino entertainment booking app',
  ],
};
