/**
 * Print Shop App Type Definition
 *
 * Complete definition for commercial printing operations.
 * Essential for print shops, copy centers, and commercial printers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'print-shop',
  name: 'Print Shop',
  category: 'retail',
  description: 'Print shop platform with order management, file preparation, production scheduling, and pickup/delivery',
  icon: 'printer',

  keywords: [
    'print shop',
    'copy center',
    'print shop software',
    'commercial printing',
    'offset printing',
    'print shop management',
    'order management',
    'print shop practice',
    'print shop scheduling',
    'file preparation',
    'print shop crm',
    'production scheduling',
    'print shop business',
    'pickup delivery',
    'print shop pos',
    'digital printing',
    'print shop operations',
    'large format',
    'print shop platform',
    'business cards',
  ],

  synonyms: [
    'print shop platform',
    'print shop software',
    'copy center software',
    'commercial printing software',
    'offset printing software',
    'order management software',
    'print shop practice software',
    'file preparation software',
    'production scheduling software',
    'digital printing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and files' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'operator', name: 'Press Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'file-upload',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a print shop platform',
    'Create a copy center app',
    'I need a commercial printing system',
    'Build a print shop management app',
    'Create a printing business portal',
  ],
};
