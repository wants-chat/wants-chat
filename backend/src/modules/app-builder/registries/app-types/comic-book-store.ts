/**
 * Comic Book Store App Type Definition
 *
 * Complete definition for comic book stores and collectible shops.
 * Essential for comic shops, graphic novel stores, and pop culture retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMIC_BOOK_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'comic-book-store',
  name: 'Comic Book Store',
  category: 'retail',
  description: 'Comic book store platform with pull list management, new release tracking, grading services, and collector subscriptions',
  icon: 'book',

  keywords: [
    'comic book store',
    'comic shop',
    'comic book store software',
    'graphic novels',
    'collectible comics',
    'comic book store management',
    'pull lists',
    'comic book store practice',
    'comic book store scheduling',
    'new releases',
    'comic book store crm',
    'grading services',
    'comic book store business',
    'back issues',
    'comic book store pos',
    'manga',
    'comic book store operations',
    'pop culture',
    'comic book store services',
    'comic retail',
  ],

  synonyms: [
    'comic book store platform',
    'comic book store software',
    'comic shop software',
    'graphic novels software',
    'collectible comics software',
    'pull lists software',
    'comic book store practice software',
    'new releases software',
    'grading services software',
    'comic retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Comics and releases' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and subscriptions' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Comic Expert', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pulls' },
    { id: 'customer', name: 'Collector', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a comic book store platform',
    'Create a comic shop portal',
    'I need a comic retail management system',
    'Build a comic book store business platform',
    'Create a pull list and subscription app',
  ],
};
