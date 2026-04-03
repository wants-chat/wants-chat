/**
 * HVAC App Type Definition
 *
 * Complete definition for HVAC and heating/cooling service applications.
 * Essential for HVAC companies, heating contractors, and AC service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HVAC_APP_TYPE: AppTypeDefinition = {
  id: 'hvac',
  name: 'HVAC Services',
  category: 'services',
  description: 'HVAC platform with service scheduling, maintenance plans, equipment tracking, and technician dispatch',
  icon: 'temperature-half',

  keywords: [
    'hvac',
    'heating',
    'cooling',
    'air conditioning',
    'ac repair',
    'furnace',
    'heat pump',
    'hvac service',
    'hvac contractor',
    'lennox',
    'carrier',
    'trane',
    'ac installation',
    'duct cleaning',
    'thermostat',
    'indoor air quality',
    'hvac maintenance',
    'refrigeration',
    'commercial hvac',
    'residential hvac',
    'mini split',
    'hvac technician',
  ],

  synonyms: [
    'hvac platform',
    'hvac software',
    'heating cooling software',
    'hvac service app',
    'hvac management',
    'ac service software',
    'hvac business app',
    'heating contractor software',
    'hvac dispatch',
    'hvac scheduling',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and manage equipment' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dispatch and service management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'HVAC Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'installer', name: 'Installer', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/installations' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-equipment' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'gallery',
    'reviews',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'equipment-tracking',
    'site-safety',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an HVAC service management platform',
    'Create a heating and cooling company app',
    'I need an HVAC dispatch and scheduling software',
    'Build an AC repair service platform',
    'Create an HVAC business management system',
  ],
};
