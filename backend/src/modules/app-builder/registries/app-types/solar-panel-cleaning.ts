/**
 * Solar Panel Cleaning App Type Definition
 *
 * Complete definition for solar panel cleaning and maintenance services.
 * Essential for solar maintenance companies, panel cleaners, and renewable energy services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_PANEL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'solar-panel-cleaning',
  name: 'Solar Panel Cleaning',
  category: 'environmental',
  description: 'Solar panel cleaning platform with job scheduling, system tracking, maintenance records, and performance monitoring',
  icon: 'sun',

  keywords: [
    'solar panel cleaning',
    'solar maintenance',
    'solar cleaning software',
    'pv cleaning',
    'panel washing',
    'solar cleaning management',
    'job scheduling',
    'solar cleaning practice',
    'solar cleaning scheduling',
    'system tracking',
    'solar cleaning crm',
    'solar farm maintenance',
    'solar cleaning business',
    'residential solar',
    'solar cleaning pos',
    'commercial solar',
    'solar cleaning operations',
    'bird proofing',
    'solar cleaning services',
    'performance optimization',
  ],

  synonyms: [
    'solar panel cleaning platform',
    'solar cleaning software',
    'solar maintenance software',
    'pv cleaning software',
    'panel washing software',
    'job scheduling software',
    'solar cleaning practice software',
    'system tracking software',
    'solar farm maintenance software',
    'performance optimization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and systems' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Cleaning Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a solar panel cleaning platform',
    'Create a solar maintenance portal',
    'I need a panel cleaning management system',
    'Build a solar farm maintenance platform',
    'Create a solar cleaning scheduling and tracking app',
  ],
};
