/**
 * Leathercraft Studio App Type Definition
 *
 * Complete definition for leatherworking and leather craft operations.
 * Essential for leather studios, saddle shops, and leather goods artisans.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEATHERCRAFT_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'leathercraft-studio',
  name: 'Leathercraft Studio',
  category: 'artisan',
  description: 'Leathercraft studio platform with custom order management, class scheduling, pattern library, and product showcase',
  icon: 'briefcase',

  keywords: [
    'leathercraft studio',
    'leather goods',
    'leathercraft studio software',
    'saddle shop',
    'leather artisan',
    'leathercraft studio management',
    'custom orders',
    'leathercraft studio practice',
    'leathercraft studio scheduling',
    'class scheduling',
    'leathercraft studio crm',
    'pattern library',
    'leathercraft studio business',
    'product showcase',
    'leathercraft studio pos',
    'tooling carving',
    'leathercraft studio operations',
    'bags wallets',
    'leathercraft studio platform',
    'belts holsters',
  ],

  synonyms: [
    'leathercraft studio platform',
    'leathercraft studio software',
    'leather goods software',
    'saddle shop software',
    'leather artisan software',
    'custom orders software',
    'leathercraft studio practice software',
    'class scheduling software',
    'pattern library software',
    'tooling carving software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and patterns' },
  ],

  roles: [
    { id: 'admin', name: 'Master Craftsman', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artisan', name: 'Leather Artisan', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'apprentice', name: 'Apprentice', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a leathercraft studio platform',
    'Create a leather goods portal',
    'I need a saddle shop system',
    'Build a leather class platform',
    'Create a custom leather order app',
  ],
};
