/**
 * Smart Home App Type Definition
 *
 * Complete definition for smart home and home automation applications.
 * Essential for smart home installers, home automation companies, and IoT integrators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMART_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'smart-home',
  name: 'Smart Home',
  category: 'energy',
  description: 'Smart home platform with device management, automation rules, energy monitoring, and remote control',
  icon: 'home',

  keywords: [
    'smart home',
    'home automation',
    'smart home software',
    'iot home',
    'smart devices',
    'home control',
    'smart lighting',
    'smart thermostat',
    'smart security',
    'home automation installer',
    'smart home integration',
    'smart home app',
    'connected home',
    'home energy management',
    'smart home business',
    'smart home hub',
    'home automation system',
    'smart home scenes',
    'voice control home',
    'smart home scheduling',
  ],

  synonyms: [
    'smart home platform',
    'smart home software',
    'home automation software',
    'iot home software',
    'smart device software',
    'home control software',
    'smart home installer software',
    'home automation installer software',
    'connected home software',
    'home energy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'smart phone'],

  sections: [
    { id: 'frontend', name: 'Homeowner App', enabled: true, basePath: '/', layout: 'public', description: 'Control and automate' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'installer', layout: 'admin', description: 'Projects and systems' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'installer', name: 'Installer', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/installations' },
    { id: 'support', name: 'Support', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/support' },
    { id: 'homeowner', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a smart home platform',
    'Create a home automation app',
    'I need a smart home installer system',
    'Build a connected home app',
    'Create a smart home control platform',
  ],
};
