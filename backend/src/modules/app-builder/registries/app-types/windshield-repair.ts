/**
 * Windshield Repair App Type Definition
 *
 * Complete definition for auto glass and windshield services.
 * Essential for auto glass shops, windshield replacement, and mobile glass repair.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDSHIELD_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'windshield-repair',
  name: 'Windshield Repair',
  category: 'automotive',
  description: 'Windshield repair platform with mobile service scheduling, insurance claims, chip repair tracking, and ADAS calibration',
  icon: 'square',

  keywords: [
    'windshield repair',
    'auto glass',
    'windshield software',
    'glass replacement',
    'windshield service',
    'windshield management',
    'chip repair',
    'auto glass shop',
    'windshield scheduling',
    'mobile glass',
    'windshield crm',
    'crack repair',
    'windshield business',
    'glass installation',
    'windshield pos',
    'ADAS calibration',
    'windshield operations',
    'window replacement',
    'windshield services',
    'glass repair',
  ],

  synonyms: [
    'windshield repair platform',
    'windshield repair software',
    'auto glass software',
    'glass replacement software',
    'windshield service software',
    'chip repair software',
    'auto glass shop software',
    'mobile glass software',
    'crack repair software',
    'ADAS calibration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home windows'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and scheduling' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'technician', name: 'Glass Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a windshield repair platform',
    'Create an auto glass scheduling app',
    'I need a mobile glass repair system',
    'Build a windshield replacement booking platform',
    'Create an ADAS calibration service app',
  ],
};
