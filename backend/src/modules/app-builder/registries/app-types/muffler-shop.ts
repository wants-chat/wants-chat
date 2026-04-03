/**
 * Muffler Shop App Type Definition
 *
 * Complete definition for exhaust and muffler service shops.
 * Essential for muffler shops, exhaust specialists, and catalytic converter services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUFFLER_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'muffler-shop',
  name: 'Muffler Shop',
  category: 'automotive',
  description: 'Muffler shop platform with exhaust system diagnostics, custom fabrication tracking, and emissions compliance',
  icon: 'volume-2',

  keywords: [
    'muffler shop',
    'exhaust repair',
    'muffler software',
    'exhaust system',
    'muffler service',
    'muffler management',
    'catalytic converter',
    'exhaust shop',
    'muffler scheduling',
    'performance exhaust',
    'muffler crm',
    'custom exhaust',
    'muffler business',
    'exhaust fabrication',
    'muffler pos',
    'emissions repair',
    'muffler operations',
    'exhaust pipes',
    'muffler services',
    'tailpipe',
  ],

  synonyms: [
    'muffler shop platform',
    'muffler shop software',
    'exhaust repair software',
    'exhaust system software',
    'muffler service software',
    'catalytic converter software',
    'exhaust shop software',
    'performance exhaust software',
    'custom exhaust software',
    'exhaust fabrication software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general auto'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and quotes' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/work-orders' },
    { id: 'technician', name: 'Exhaust Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
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

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a muffler shop platform',
    'Create an exhaust repair management app',
    'I need a custom exhaust fabrication system',
    'Build an exhaust shop scheduling platform',
    'Create a catalytic converter service app',
  ],
};
