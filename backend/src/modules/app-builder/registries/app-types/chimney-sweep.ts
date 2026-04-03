/**
 * Chimney Sweep App Type Definition
 *
 * Complete definition for chimney sweep and fireplace cleaning applications.
 * Essential for chimney sweeps, fireplace services, and chimney inspection companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHIMNEY_SWEEP_APP_TYPE: AppTypeDefinition = {
  id: 'chimney-sweep',
  name: 'Chimney Sweep',
  category: 'cleaning',
  description: 'Chimney sweep platform with inspection scheduling, cleaning services, repair tracking, and seasonal booking',
  icon: 'flame',

  keywords: [
    'chimney sweep',
    'chimney cleaning',
    'chimney sweep software',
    'fireplace cleaning',
    'chimney inspection',
    'chimney sweep booking',
    'chimney services',
    'chimney repair',
    'chimney sweep scheduling',
    'flue cleaning',
    'chimney sweep crm',
    'wood stove cleaning',
    'chimney sweep business',
    'chimney cap',
    'chimney sweep pos',
    'creosote removal',
    'chimney sweep management',
    'chimney liner',
    'chimney sweep services',
    'fireplace inspection',
  ],

  synonyms: [
    'chimney sweep platform',
    'chimney sweep software',
    'chimney cleaning software',
    'fireplace cleaning software',
    'chimney inspection software',
    'chimney services software',
    'chimney sweep scheduling software',
    'chimney repair software',
    'chimney sweep management software',
    'flue cleaning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'factory chimney'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and inspections' },
    { id: 'admin', name: 'Chimney Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Chimney Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'cleaning',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a chimney sweep booking platform',
    'Create a fireplace cleaning scheduling app',
    'I need a chimney inspection management system',
    'Build a chimney services app',
    'Create a chimney sweep business platform',
  ],
};
