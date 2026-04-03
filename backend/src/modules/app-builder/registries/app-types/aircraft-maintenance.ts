/**
 * Aircraft Maintenance App Type Definition
 *
 * Complete definition for aircraft maintenance and MRO facilities.
 * Essential for aircraft MROs, avionics shops, and aviation maintenance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRCRAFT_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'aircraft-maintenance',
  name: 'Aircraft Maintenance',
  category: 'aviation',
  description: 'Aircraft maintenance platform with work orders, parts inventory, compliance tracking, and maintenance records',
  icon: 'wrench',

  keywords: [
    'aircraft maintenance',
    'mro services',
    'aircraft maintenance software',
    'aviation repair',
    'avionics shop',
    'aircraft maintenance management',
    'work orders',
    'aircraft maintenance practice',
    'aircraft maintenance scheduling',
    'parts inventory',
    'aircraft maintenance crm',
    'faa compliance',
    'aircraft maintenance business',
    'airframe repair',
    'aircraft maintenance pos',
    'engine overhaul',
    'aircraft maintenance operations',
    'component repair',
    'aircraft maintenance services',
    'ad compliance',
  ],

  synonyms: [
    'aircraft maintenance platform',
    'aircraft maintenance software',
    'mro services software',
    'aviation repair software',
    'avionics shop software',
    'work orders software',
    'aircraft maintenance practice software',
    'parts inventory software',
    'faa compliance software',
    'airframe repair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Aircraft and work' },
    { id: 'admin', name: 'MRO Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'MRO Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Maintenance Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/workorders' },
    { id: 'mechanic', name: 'A&P Mechanic', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'customer', name: 'Aircraft Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an aircraft maintenance platform',
    'Create an MRO services portal',
    'I need an aviation repair management system',
    'Build an avionics shop platform',
    'Create a work order and parts tracking app',
  ],
};
