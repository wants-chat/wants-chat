/**
 * Wind Energy App Type Definition
 *
 * Complete definition for wind farm and wind energy applications.
 * Essential for wind farm operators, turbine manufacturers, and wind energy developers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIND_ENERGY_APP_TYPE: AppTypeDefinition = {
  id: 'wind-energy',
  name: 'Wind Energy',
  category: 'energy',
  description: 'Wind energy platform with turbine monitoring, maintenance scheduling, production analytics, and grid integration',
  icon: 'wind',

  keywords: [
    'wind energy',
    'wind farm',
    'wind turbine',
    'wind power',
    'wind energy software',
    'wind farm management',
    'turbine monitoring',
    'wind production',
    'wind maintenance',
    'wind operations',
    'renewable wind',
    'wind project',
    'wind developer',
    'wind asset',
    'wind analytics',
    'offshore wind',
    'onshore wind',
    'wind scada',
    'wind energy business',
    'wind portfolio',
  ],

  synonyms: [
    'wind energy platform',
    'wind energy software',
    'wind farm software',
    'wind turbine software',
    'wind power software',
    'wind farm management software',
    'turbine monitoring software',
    'wind production software',
    'wind maintenance software',
    'wind operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'wind instrument'],

  sections: [
    { id: 'frontend', name: 'Investor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and performance' },
    { id: 'admin', name: 'Wind Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Turbines and production' },
  ],

  roles: [
    { id: 'admin', name: 'Asset Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Site Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'engineer', name: 'Wind Engineer', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/turbines' },
    { id: 'operator', name: 'Control Room Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/monitoring' },
    { id: 'investor', name: 'Investor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a wind farm management platform',
    'Create a wind turbine monitoring app',
    'I need a wind energy production system',
    'Build a wind asset management app',
    'Create a wind energy operations platform',
  ],
};
