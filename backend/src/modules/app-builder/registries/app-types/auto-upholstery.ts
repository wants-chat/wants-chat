/**
 * Auto Upholstery App Type Definition
 *
 * Complete definition for auto upholstery and interior restoration shops.
 * Essential for car interior shops, seat repair, and custom upholstery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_UPHOLSTERY_APP_TYPE: AppTypeDefinition = {
  id: 'auto-upholstery',
  name: 'Auto Upholstery',
  category: 'automotive',
  description: 'Auto upholstery platform with project tracking, material inventory, custom design quotes, and photo galleries',
  icon: 'armchair',

  keywords: [
    'auto upholstery',
    'car interior',
    'auto upholstery software',
    'seat repair',
    'auto upholstery shop',
    'auto upholstery management',
    'custom upholstery',
    'leather repair',
    'auto upholstery scheduling',
    'convertible top',
    'auto upholstery crm',
    'headliner',
    'auto upholstery business',
    'carpet replacement',
    'auto upholstery pos',
    'door panels',
    'auto upholstery operations',
    'vinyl repair',
    'auto upholstery services',
    'interior restoration',
  ],

  synonyms: [
    'auto upholstery platform',
    'auto upholstery software',
    'car interior software',
    'seat repair software',
    'auto upholstery shop software',
    'custom upholstery software',
    'leather repair software',
    'convertible top software',
    'interior restoration software',
    'auto trim software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home furniture'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and quotes' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'craftsman', layout: 'admin', description: 'Projects and materials' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'craftsman', name: 'Upholsterer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/work' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build an auto upholstery shop platform',
    'Create a car interior restoration app',
    'I need a custom upholstery management system',
    'Build a seat repair scheduling platform',
    'Create a leather restoration shop app',
  ],
};
