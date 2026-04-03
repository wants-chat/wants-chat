/**
 * Transmission Shop App Type Definition
 *
 * Complete definition for transmission repair and rebuild shops.
 * Essential for transmission specialists, clutch repair, and drivetrain services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSMISSION_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'transmission-shop',
  name: 'Transmission Shop',
  category: 'automotive',
  description: 'Transmission shop platform with repair tracking, diagnostic integration, parts inventory, and warranty management',
  icon: 'cog',

  keywords: [
    'transmission shop',
    'transmission repair',
    'transmission software',
    'transmission rebuild',
    'transmission service',
    'transmission management',
    'clutch repair',
    'drivetrain',
    'transmission scheduling',
    'automatic transmission',
    'transmission crm',
    'manual transmission',
    'transmission business',
    'cvt repair',
    'transmission pos',
    'differential repair',
    'transmission operations',
    'torque converter',
    'transmission services',
    'gearbox repair',
  ],

  synonyms: [
    'transmission shop platform',
    'transmission shop software',
    'transmission repair software',
    'transmission rebuild software',
    'clutch repair software',
    'drivetrain software',
    'transmission service software',
    'automatic transmission software',
    'manual transmission software',
    'gearbox repair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general auto'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Repairs and status' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/work-orders' },
    { id: 'technician', name: 'Transmission Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
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

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a transmission shop platform',
    'Create a transmission repair management app',
    'I need a transmission rebuild tracking system',
    'Build a drivetrain service platform',
    'Create a clutch repair shop app',
  ],
};
