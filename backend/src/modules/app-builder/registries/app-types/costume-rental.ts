/**
 * Costume Rental App Type Definition
 *
 * Complete definition for costume rental and theatrical wardrobe.
 * Essential for costume shops, theatrical rentals, and Halloween stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COSTUME_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'costume-rental',
  name: 'Costume Rental',
  category: 'rental',
  description: 'Costume rental platform with catalog search, sizing guide, reservation system, and production management',
  icon: 'shirt',

  keywords: [
    'costume rental',
    'theatrical wardrobe',
    'costume rental software',
    'halloween costumes',
    'costume shop',
    'costume rental management',
    'catalog search',
    'costume rental practice',
    'costume rental scheduling',
    'sizing guide',
    'costume rental crm',
    'period costumes',
    'costume rental business',
    'mascot rentals',
    'costume rental pos',
    'production costumes',
    'costume rental operations',
    'cosplay rentals',
    'costume rental platform',
    'theme party',
  ],

  synonyms: [
    'costume rental platform',
    'costume rental software',
    'theatrical wardrobe software',
    'halloween costumes software',
    'costume shop software',
    'catalog search software',
    'costume rental practice software',
    'sizing guide software',
    'period costumes software',
    'production costumes software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'technology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Costumes and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Wardrobe Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Fitting Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fittings' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a costume rental platform',
    'Create a theatrical wardrobe portal',
    'I need a costume shop management system',
    'Build a Halloween costume rental platform',
    'Create a costume catalog and reservation app',
  ],
};
