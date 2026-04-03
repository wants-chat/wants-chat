/**
 * Specialty Bookstore App Type Definition
 *
 * Complete definition for specialty bookstore operations.
 * Essential for independent bookstores, rare book dealers, and niche book shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_BOOKSTORE_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-bookstore',
  name: 'Specialty Bookstore',
  category: 'retail',
  description: 'Specialty bookstore platform with inventory catalog, author events, book clubs, and special orders',
  icon: 'book',

  keywords: [
    'specialty bookstore',
    'independent bookstore',
    'specialty bookstore software',
    'rare book dealer',
    'niche books',
    'specialty bookstore management',
    'inventory catalog',
    'specialty bookstore practice',
    'specialty bookstore scheduling',
    'author events',
    'specialty bookstore crm',
    'book clubs',
    'specialty bookstore business',
    'special orders',
    'specialty bookstore pos',
    'used books',
    'specialty bookstore operations',
    'signed editions',
    'specialty bookstore platform',
    'first editions',
  ],

  synonyms: [
    'specialty bookstore platform',
    'specialty bookstore software',
    'independent bookstore software',
    'rare book dealer software',
    'niche books software',
    'inventory catalog software',
    'specialty bookstore practice software',
    'author events software',
    'book clubs software',
    'used books software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Bookshop', enabled: true, basePath: '/', layout: 'public', description: 'Books and events' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and events' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'bookseller', name: 'Bookseller', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
    { id: 'reader', name: 'Reader', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a specialty bookstore platform',
    'Create an independent bookshop app',
    'I need a rare book dealer system',
    'Build a niche bookstore app',
    'Create a specialty bookstore portal',
  ],
};
