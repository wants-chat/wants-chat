/**
 * Embroidery Shop App Type Definition
 *
 * Complete definition for embroidery and custom apparel operations.
 * Essential for embroidery shops, custom apparel, and promotional products.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMBROIDERY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'embroidery-shop',
  name: 'Embroidery Shop',
  category: 'retail',
  description: 'Embroidery shop platform with order management, digitizing workflow, production scheduling, and proof approval',
  icon: 'shirt',

  keywords: [
    'embroidery shop',
    'custom apparel',
    'embroidery shop software',
    'promotional products',
    'screen printing',
    'embroidery shop management',
    'order management',
    'embroidery shop practice',
    'embroidery shop scheduling',
    'digitizing workflow',
    'embroidery shop crm',
    'production scheduling',
    'embroidery shop business',
    'proof approval',
    'embroidery shop pos',
    'corporate apparel',
    'embroidery shop operations',
    'team uniforms',
    'embroidery shop platform',
    'heat transfer',
  ],

  synonyms: [
    'embroidery shop platform',
    'embroidery shop software',
    'custom apparel software',
    'promotional products software',
    'screen printing software',
    'order management software',
    'embroidery shop practice software',
    'digitizing workflow software',
    'production scheduling software',
    'corporate apparel software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'operator', name: 'Machine Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
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
    'product-catalog',
    'clients',
    'shipping',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build an embroidery shop platform',
    'Create a custom apparel app',
    'I need an embroidery order system',
    'Build a screen printing shop app',
    'Create an embroidery business portal',
  ],
};
