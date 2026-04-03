/**
 * Duct Cleaning App Type Definition
 *
 * Complete definition for air duct cleaning and HVAC cleaning applications.
 * Essential for duct cleaning companies, HVAC cleaners, and indoor air quality services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DUCT_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'duct-cleaning',
  name: 'Duct Cleaning',
  category: 'cleaning',
  description: 'Duct cleaning platform with service scheduling, before/after documentation, vent tracking, and package pricing',
  icon: 'wind',

  keywords: [
    'duct cleaning',
    'air duct cleaning',
    'hvac cleaning',
    'duct cleaning software',
    'vent cleaning',
    'duct cleaning booking',
    'dryer vent cleaning',
    'duct cleaning service',
    'duct cleaning scheduling',
    'air quality',
    'duct cleaning crm',
    'furnace cleaning',
    'duct cleaning business',
    'ac cleaning',
    'duct cleaning pos',
    'duct inspection',
    'duct cleaning management',
    'duct sanitization',
    'duct cleaning services',
    'indoor air',
  ],

  synonyms: [
    'duct cleaning platform',
    'duct cleaning software',
    'air duct cleaning software',
    'hvac cleaning software',
    'vent cleaning software',
    'duct cleaning booking software',
    'duct cleaning scheduling software',
    'duct cleaning management software',
    'dryer vent cleaning software',
    'air quality cleaning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'hvac repair'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and quotes' },
    { id: 'admin', name: 'Duct Cleaning Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'gallery',
    'discounts',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
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

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a duct cleaning booking platform',
    'Create an air duct cleaning scheduling app',
    'I need a duct cleaning business management system',
    'Build a dryer vent cleaning service app',
    'Create a duct inspection platform',
  ],
};
