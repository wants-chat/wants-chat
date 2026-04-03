/**
 * Sign Shop App Type Definition
 *
 * Complete definition for sign making and graphics operations.
 * Essential for sign shops, vehicle wraps, and custom graphics companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIGN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'sign-shop',
  name: 'Sign Shop',
  category: 'retail',
  description: 'Sign shop platform with project estimation, design approval, production tracking, and installation scheduling',
  icon: 'badge',

  keywords: [
    'sign shop',
    'vehicle wraps',
    'sign shop software',
    'custom graphics',
    'banner printing',
    'sign shop management',
    'project estimation',
    'sign shop practice',
    'sign shop scheduling',
    'design approval',
    'sign shop crm',
    'production tracking',
    'sign shop business',
    'installation scheduling',
    'sign shop pos',
    'vinyl graphics',
    'sign shop operations',
    'channel letters',
    'sign shop platform',
    'monument signs',
  ],

  synonyms: [
    'sign shop platform',
    'sign shop software',
    'vehicle wraps software',
    'custom graphics software',
    'banner printing software',
    'project estimation software',
    'sign shop practice software',
    'design approval software',
    'production tracking software',
    'vinyl graphics software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and quotes' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Graphic Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'fabricator', name: 'Fabricator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a sign shop platform',
    'Create a vehicle wrap company app',
    'I need a sign making system',
    'Build a custom graphics shop app',
    'Create a sign business portal',
  ],
};
