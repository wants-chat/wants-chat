/**
 * Oil Change App Type Definition
 *
 * Complete definition for quick lube and oil change services.
 * Essential for quick lube centers, oil change shops, and express maintenance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OIL_CHANGE_APP_TYPE: AppTypeDefinition = {
  id: 'oil-change',
  name: 'Oil Change',
  category: 'automotive',
  description: 'Oil change platform with express service scheduling, vehicle history, upsell tracking, and loyalty programs',
  icon: 'droplet',

  keywords: [
    'oil change',
    'quick lube',
    'oil change software',
    'lube service',
    'oil change shop',
    'oil change management',
    'express lube',
    'oil change center',
    'oil change scheduling',
    'fluid service',
    'oil change crm',
    'synthetic oil',
    'oil change business',
    'filter change',
    'oil change pos',
    'preventive maintenance',
    'oil change operations',
    'quick service',
    'oil change services',
    'lubricants',
  ],

  synonyms: [
    'oil change platform',
    'oil change software',
    'quick lube software',
    'lube service software',
    'oil change shop software',
    'express lube software',
    'oil change center software',
    'fluid service software',
    'quick service software',
    'lubricant service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'full auto repair'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Schedule and history' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Bays and services' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/services' },
    { id: 'technician', name: 'Lube Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bays' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'vehicle-history',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'parts-catalog',
    'recalls-tracking',
    'clients',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'automotive',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an oil change shop platform',
    'Create a quick lube scheduling app',
    'I need an express lube management system',
    'Build a lube center customer portal',
    'Create an oil change service app',
  ],
};
