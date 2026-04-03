/**
 * Hobby Shop App Type Definition
 *
 * Complete definition for hobby shops and craft supply retailers.
 * Essential for hobby stores, craft supply shops, and specialty hobby retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOBBY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'hobby-shop',
  name: 'Hobby Shop',
  category: 'retail',
  description: 'Hobby shop platform with craft supplies inventory, workshop scheduling, club memberships, and project tutorials',
  icon: 'scissors',

  keywords: [
    'hobby shop',
    'craft store',
    'hobby shop software',
    'model kits',
    'craft supplies',
    'hobby shop management',
    'workshops',
    'hobby shop practice',
    'hobby shop scheduling',
    'RC models',
    'hobby shop crm',
    'scrapbooking',
    'hobby shop business',
    'train sets',
    'hobby shop pos',
    'miniatures',
    'hobby shop operations',
    'drones',
    'hobby shop services',
    'hobby retail',
  ],

  synonyms: [
    'hobby shop platform',
    'hobby shop software',
    'craft store software',
    'model kits software',
    'craft supplies software',
    'workshops software',
    'hobby shop practice software',
    'RC models software',
    'scrapbooking software',
    'hobby retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Supplies and workshops' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and events' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Hobby Expert', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/workshops' },
    { id: 'customer', name: 'Hobbyist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a hobby shop platform',
    'Create a craft supply store portal',
    'I need a hobby retail management system',
    'Build a hobby shop business platform',
    'Create a craft supply and workshop app',
  ],
};
