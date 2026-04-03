/**
 * Gun Range App Type Definition
 *
 * Complete definition for shooting range and firearms training operations.
 * Essential for gun ranges, shooting clubs, and firearms training facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GUN_RANGE_APP_TYPE: AppTypeDefinition = {
  id: 'gun-range',
  name: 'Gun Range',
  category: 'sports',
  description: 'Gun range platform with lane booking, safety certification, membership management, and firearms training',
  icon: 'crosshair',

  keywords: [
    'gun range',
    'shooting range',
    'gun range software',
    'firearms training',
    'shooting club',
    'gun range management',
    'lane booking',
    'gun range practice',
    'gun range scheduling',
    'safety certification',
    'gun range crm',
    'membership management',
    'gun range business',
    'firearms training',
    'gun range pos',
    'handgun',
    'gun range operations',
    'rifle range',
    'gun range platform',
    'concealed carry',
  ],

  synonyms: [
    'gun range platform',
    'gun range software',
    'shooting range software',
    'firearms training software',
    'shooting club software',
    'lane booking software',
    'gun range practice software',
    'safety certification software',
    'membership management software',
    'handgun software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lanes and training' },
    { id: 'admin', name: 'Range Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Reservations and safety' },
  ],

  roles: [
    { id: 'admin', name: 'Range Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Range Safety Officer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Range Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lanes' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
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
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a gun range platform',
    'Create a shooting range portal',
    'I need a firearms training system',
    'Build a lane booking platform',
    'Create a range membership app',
  ],
};
