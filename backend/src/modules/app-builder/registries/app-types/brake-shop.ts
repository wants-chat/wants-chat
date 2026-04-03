/**
 * Brake Shop App Type Definition
 *
 * Complete definition for brake service and repair shops.
 * Essential for brake specialists, rotor machining, and brake system services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BRAKE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'brake-shop',
  name: 'Brake Shop',
  category: 'automotive',
  description: 'Brake shop platform with inspection tracking, parts inventory, rotor machining logs, and warranty management',
  icon: 'circle-stop',

  keywords: [
    'brake shop',
    'brake repair',
    'brake software',
    'brake service',
    'brake inspection',
    'brake management',
    'brake pads',
    'brake rotors',
    'brake scheduling',
    'brake fluid',
    'brake crm',
    'brake lines',
    'brake business',
    'brake calipers',
    'brake pos',
    'ABS repair',
    'brake operations',
    'brake drums',
    'brake services',
    'brake system',
  ],

  synonyms: [
    'brake shop platform',
    'brake shop software',
    'brake repair software',
    'brake service software',
    'brake inspection software',
    'brake pads software',
    'brake rotors software',
    'ABS repair software',
    'brake system software',
    'brake specialist software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general auto'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and inspections' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/work-orders' },
    { id: 'technician', name: 'Brake Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/services' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-history',
    'recalls-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a brake shop platform',
    'Create a brake repair management app',
    'I need a brake service scheduling system',
    'Build a brake inspection tracking platform',
    'Create a brake specialist shop app',
  ],
};
