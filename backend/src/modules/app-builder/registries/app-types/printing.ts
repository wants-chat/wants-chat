/**
 * Printing Services App Type Definition
 *
 * Complete definition for printing and print shop applications.
 * Essential for print shops, copy centers, and commercial printers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'printing',
  name: 'Printing Services',
  category: 'services',
  description: 'Print shop platform with online ordering, file upload, proofing, and production management',
  icon: 'print',

  keywords: [
    'printing',
    'print shop',
    'copy center',
    'commercial printing',
    'vistaprint',
    'fedex office',
    'ups store',
    'staples printing',
    'business cards',
    'brochures',
    'flyers',
    'banners',
    'signs',
    'large format',
    'digital printing',
    'offset printing',
    'custom printing',
    'promotional products',
    't-shirt printing',
    'apparel printing',
    'print on demand',
    'print services',
  ],

  synonyms: [
    'printing platform',
    'print shop software',
    'print ordering system',
    'printing services app',
    'print management software',
    'copy center app',
    'commercial printing software',
    'print business app',
    'print shop app',
    'printing management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Store', enabled: true, basePath: '/', layout: 'public', description: 'Order prints and upload files' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Production and order management' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'production', name: 'Production Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'designer', name: 'Graphic Designer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/designs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'file-upload',
    'shopping-cart',
    'checkout',
    'orders',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'shipping',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'workout-plans', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a print shop ordering platform',
    'Create a printing services ecommerce app',
    'I need a commercial printing management system',
    'Build a print shop like Vistaprint',
    'Create a custom printing ordering system',
  ],
};
