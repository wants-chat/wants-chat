/**
 * Scuba Dive Shop App Type Definition
 *
 * Complete definition for scuba dive shop operations.
 * Essential for dive shops, scuba retailers, and diving centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCUBA_DIVE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'scuba-dive-shop',
  name: 'Scuba Dive Shop',
  category: 'retail',
  description: 'Scuba dive shop platform with certification tracking, equipment sales, dive trip booking, and tank fills',
  icon: 'waves',

  keywords: [
    'scuba dive shop',
    'dive center',
    'scuba dive shop software',
    'scuba retailer',
    'padi shop',
    'scuba dive shop management',
    'certification tracking',
    'scuba dive shop practice',
    'scuba dive shop scheduling',
    'equipment sales',
    'scuba dive shop crm',
    'dive trip booking',
    'scuba dive shop business',
    'tank fills',
    'scuba dive shop pos',
    'dive courses',
    'scuba dive shop operations',
    'equipment rental',
    'scuba dive shop platform',
    'snorkeling',
  ],

  synonyms: [
    'scuba dive shop platform',
    'scuba dive shop software',
    'dive center software',
    'scuba retailer software',
    'padi shop software',
    'certification tracking software',
    'scuba dive shop practice software',
    'equipment sales software',
    'dive trip booking software',
    'dive courses software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and trips' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Dive Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courses' },
    { id: 'divemaster', name: 'Divemaster', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'customer', name: 'Diver', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'aquatic',

  examplePrompts: [
    'Build a scuba dive shop platform',
    'Create a dive center app',
    'I need a scuba retail system',
    'Build a PADI shop management app',
    'Create a dive shop portal',
  ],
};
