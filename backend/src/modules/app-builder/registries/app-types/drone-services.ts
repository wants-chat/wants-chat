/**
 * Drone Services App Type Definition
 *
 * Complete definition for drone service providers and UAV operations.
 * Essential for drone operators, aerial photography, and inspection services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRONE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'drone-services',
  name: 'Drone Services',
  category: 'aviation',
  description: 'Drone services platform with flight planning, pilot scheduling, deliverable management, and client portal',
  icon: 'radio',

  keywords: [
    'drone services',
    'uav operations',
    'drone services software',
    'aerial photography',
    'drone inspections',
    'drone services management',
    'flight planning',
    'drone services practice',
    'drone services scheduling',
    'pilot scheduling',
    'drone services crm',
    'mapping services',
    'drone services business',
    'surveying',
    'drone services pos',
    'thermal imaging',
    'drone services operations',
    'part 107',
    'drone services platform',
    'agricultural drones',
  ],

  synonyms: [
    'drone services platform',
    'drone services software',
    'uav operations software',
    'aerial photography software',
    'drone inspections software',
    'flight planning software',
    'drone services practice software',
    'pilot scheduling software',
    'mapping services software',
    'agricultural drones software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and projects' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Flights and pilots' },
  ],

  roles: [
    { id: 'admin', name: 'Operations Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Flight Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/missions' },
    { id: 'pilot', name: 'Drone Pilot', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/flights' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'dashboard',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'aviation',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a drone services platform',
    'Create a UAV operations portal',
    'I need an aerial photography management system',
    'Build a drone inspection service platform',
    'Create a flight planning and pilot scheduling app',
  ],
};
