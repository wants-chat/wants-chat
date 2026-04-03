/**
 * Irrigation System App Type Definition
 *
 * Complete definition for irrigation management and water control applications.
 * Essential for smart irrigation, agricultural water management, and landscape irrigation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IRRIGATION_SYSTEM_APP_TYPE: AppTypeDefinition = {
  id: 'irrigation-system',
  name: 'Irrigation System',
  category: 'agriculture',
  description: 'Irrigation management platform with scheduling, sensor monitoring, water usage tracking, and automation',
  icon: 'droplet',

  keywords: [
    'irrigation system',
    'irrigation management',
    'smart irrigation',
    'water management',
    'irrigation scheduling',
    'irrigation control',
    'drip irrigation',
    'sprinkler system',
    'irrigation automation',
    'water conservation',
    'irrigation sensors',
    'soil moisture',
    'irrigation software',
    'farm irrigation',
    'landscape irrigation',
    'irrigation monitoring',
    'water usage',
    'irrigation zones',
    'pivot irrigation',
    'irrigation efficiency',
  ],

  synonyms: [
    'irrigation management platform',
    'irrigation management software',
    'smart irrigation software',
    'water management software',
    'irrigation control software',
    'irrigation scheduling software',
    'irrigation automation software',
    'farm irrigation software',
    'irrigation monitoring platform',
    'water conservation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'medical irrigation'],

  sections: [
    { id: 'frontend', name: 'Field View', enabled: true, basePath: '/', layout: 'public', description: 'Irrigation status overview' },
    { id: 'admin', name: 'Irrigation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Scheduling and control' },
  ],

  roles: [
    { id: 'admin', name: 'System Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Irrigation Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/zones' },
    { id: 'technician', name: 'Technician', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'operator', name: 'Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'workflow',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a smart irrigation system',
    'Create an irrigation management app',
    'I need a water management platform',
    'Build an irrigation scheduling system',
    'Create a farm irrigation controller',
  ],
};
