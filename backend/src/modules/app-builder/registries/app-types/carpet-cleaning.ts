/**
 * Carpet Cleaning App Type Definition
 *
 * Complete definition for carpet cleaning and upholstery cleaning applications.
 * Essential for carpet cleaners, upholstery services, and floor care businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CARPET_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'carpet-cleaning',
  name: 'Carpet Cleaning',
  category: 'cleaning',
  description: 'Carpet cleaning platform with job scheduling, room-based pricing, before/after photos, and recurring service management',
  icon: 'sparkles',

  keywords: [
    'carpet cleaning',
    'upholstery cleaning',
    'carpet cleaner',
    'cleaning software',
    'floor cleaning',
    'carpet cleaning booking',
    'rug cleaning',
    'carpet care',
    'carpet cleaning scheduling',
    'steam cleaning',
    'carpet cleaning crm',
    'deep cleaning',
    'carpet cleaning business',
    'stain removal',
    'carpet cleaning pos',
    'carpet restoration',
    'tile cleaning',
    'carpet cleaning management',
    'carpet cleaning services',
    'floor care',
  ],

  synonyms: [
    'carpet cleaning platform',
    'carpet cleaning software',
    'upholstery cleaning software',
    'floor cleaning software',
    'carpet cleaner software',
    'rug cleaning software',
    'carpet cleaning booking software',
    'carpet cleaning scheduling software',
    'carpet cleaning management software',
    'floor care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'carpet sales'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and quotes' },
    { id: 'admin', name: 'Cleaning Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and schedule' },
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
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'discounts',
    'clients',
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a carpet cleaning booking platform',
    'Create an upholstery cleaning scheduling app',
    'I need a carpet cleaning business management system',
    'Build a floor care service app',
    'Create a carpet cleaning estimation platform',
  ],
};
