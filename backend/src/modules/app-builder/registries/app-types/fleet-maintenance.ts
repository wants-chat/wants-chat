/**
 * Fleet Maintenance App Type Definition
 *
 * Complete definition for fleet maintenance and vehicle service applications.
 * Essential for fleet operators, maintenance shops, and vehicle management companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLEET_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'fleet-maintenance',
  name: 'Fleet Maintenance',
  category: 'automotive',
  description: 'Fleet maintenance platform with service scheduling, work orders, parts inventory, and vehicle tracking',
  icon: 'truck',

  keywords: [
    'fleet maintenance',
    'fleet service',
    'fleet maintenance software',
    'vehicle maintenance',
    'fleet repair',
    'fleet work orders',
    'fleet parts',
    'fleet scheduling',
    'preventive maintenance',
    'fleet management',
    'truck maintenance',
    'fleet shop',
    'vehicle service',
    'fleet inspection',
    'maintenance tracking',
    'fleet business',
    'fleet operations',
    'vehicle repair',
    'fleet inventory',
    'maintenance management',
  ],

  synonyms: [
    'fleet maintenance platform',
    'fleet maintenance software',
    'vehicle maintenance software',
    'fleet service software',
    'fleet repair software',
    'fleet work order software',
    'preventive maintenance software',
    'fleet shop software',
    'maintenance tracking software',
    'fleet operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'naval fleet'],

  sections: [
    { id: 'frontend', name: 'Driver Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and status' },
    { id: 'admin', name: 'Maintenance Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Fleet Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Shop Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Technician', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/workorders' },
    { id: 'parts', name: 'Parts Clerk', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'driver', name: 'Driver', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-inventory',
    'vehicle-history',
    'recalls-tracking',
    'invoicing',
    'notifications',
    'search',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
    'route-optimization',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fleet maintenance platform',
    'Create a vehicle service management app',
    'I need a fleet work order system',
    'Build a preventive maintenance app',
    'Create a fleet parts inventory platform',
  ],
};
