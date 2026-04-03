/**
 * Bookstore App Type Definition
 *
 * Complete definition for bookstores and literary retail.
 * Essential for independent bookshops, used bookstores, and specialty book retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOOKSTORE_APP_TYPE: AppTypeDefinition = {
  id: 'bookstore',
  name: 'Bookstore',
  category: 'retail',
  description: 'Bookstore platform with inventory catalog, author events, book clubs, and special orders management',
  icon: 'book-open',

  keywords: [
    'bookstore',
    'book shop',
    'bookstore software',
    'independent bookstore',
    'used books',
    'bookstore management',
    'author events',
    'bookstore practice',
    'bookstore scheduling',
    'book clubs',
    'bookstore crm',
    'rare books',
    'bookstore business',
    'special orders',
    'bookstore pos',
    'new releases',
    'bookstore operations',
    'literary events',
    'bookstore services',
    'book retail',
  ],

  synonyms: [
    'bookstore platform',
    'bookstore software',
    'book shop software',
    'independent bookstore software',
    'used books software',
    'author events software',
    'bookstore practice software',
    'book clubs software',
    'rare books software',
    'book retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Books and events' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Bookseller', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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
    'email',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a bookstore platform',
    'Create an independent bookshop portal',
    'I need a book retail management system',
    'Build a bookstore business platform',
    'Create a book inventory and events app',
  ],
};
