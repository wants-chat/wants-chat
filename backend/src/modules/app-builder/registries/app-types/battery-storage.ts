/**
 * Battery Storage App Type Definition
 *
 * Complete definition for battery energy storage system applications.
 * Essential for battery storage operators, energy storage developers, and grid services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BATTERY_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'battery-storage',
  name: 'Battery Storage',
  category: 'energy',
  description: 'Battery storage platform with system monitoring, dispatch optimization, grid services, and performance analytics',
  icon: 'battery',

  keywords: [
    'battery storage',
    'energy storage',
    'battery software',
    'bess',
    'grid battery',
    'battery management',
    'energy storage system',
    'battery monitoring',
    'battery dispatch',
    'grid services',
    'peak shaving',
    'load shifting',
    'battery analytics',
    'storage operations',
    'utility storage',
    'commercial storage',
    'residential battery',
    'battery portfolio',
    'storage asset',
    'battery performance',
  ],

  synonyms: [
    'battery storage platform',
    'battery storage software',
    'energy storage software',
    'bess software',
    'battery management software',
    'battery monitoring software',
    'grid storage software',
    'storage operations software',
    'battery dispatch software',
    'storage asset software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'phone battery'],

  sections: [
    { id: 'frontend', name: 'Investor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Performance and returns' },
    { id: 'admin', name: 'Storage Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Systems and dispatch' },
  ],

  roles: [
    { id: 'admin', name: 'Asset Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/systems' },
    { id: 'operator', name: 'Control Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/monitoring' },
    { id: 'engineer', name: 'Engineer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/performance' },
    { id: 'investor', name: 'Investor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a battery storage platform',
    'Create an energy storage monitoring app',
    'I need a BESS management system',
    'Build a grid storage dispatch app',
    'Create a battery asset management platform',
  ],
};
