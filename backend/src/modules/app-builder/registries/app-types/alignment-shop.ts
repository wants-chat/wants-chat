/**
 * Alignment Shop App Type Definition
 *
 * Complete definition for wheel alignment and balancing services.
 * Essential for alignment shops, suspension specialists, and tire balancing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALIGNMENT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'alignment-shop',
  name: 'Alignment Shop',
  category: 'automotive',
  description: 'Alignment shop platform with alignment specs, before/after reports, suspension diagnostics, and equipment calibration',
  icon: 'ruler',

  keywords: [
    'alignment shop',
    'wheel alignment',
    'alignment software',
    'tire balancing',
    'alignment service',
    'alignment management',
    'suspension',
    'alignment center',
    'alignment scheduling',
    'camber',
    'alignment crm',
    'caster',
    'alignment business',
    'toe adjustment',
    'alignment pos',
    'wheel balancing',
    'alignment operations',
    'steering',
    'alignment services',
    'chassis',
  ],

  synonyms: [
    'alignment shop platform',
    'alignment shop software',
    'wheel alignment software',
    'tire balancing software',
    'alignment service software',
    'suspension software',
    'alignment center software',
    'wheel balancing software',
    'steering alignment software',
    'chassis alignment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general auto'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service and reports' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Alignments and specs' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Alignment Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/alignments' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an alignment shop platform',
    'Create a wheel alignment scheduling app',
    'I need a tire balancing management system',
    'Build a suspension diagnostics platform',
    'Create an alignment center app',
  ],
};
