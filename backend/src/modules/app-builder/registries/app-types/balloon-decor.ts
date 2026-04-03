/**
 * Balloon Decor App Type Definition
 *
 * Complete definition for balloon decoration operations.
 * Essential for balloon artists, decor services, and event decoration companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BALLOON_DECOR_APP_TYPE: AppTypeDefinition = {
  id: 'balloon-decor',
  name: 'Balloon Decor',
  category: 'services',
  description: 'Balloon decor platform with order management, design gallery, customization tools, and delivery scheduling',
  icon: 'party-popper',

  keywords: [
    'balloon decor',
    'balloon artist',
    'balloon decor software',
    'event decoration',
    'balloon arrangements',
    'balloon decor management',
    'order management',
    'balloon decor practice',
    'balloon decor scheduling',
    'design gallery',
    'balloon decor crm',
    'customization tools',
    'balloon decor business',
    'delivery scheduling',
    'balloon decor pos',
    'balloon garlands',
    'balloon decor operations',
    'balloon columns',
    'balloon decor platform',
    'organic balloons',
  ],

  synonyms: [
    'balloon decor platform',
    'balloon decor software',
    'balloon artist software',
    'event decoration software',
    'balloon arrangements software',
    'order management software',
    'balloon decor practice software',
    'design gallery software',
    'customization tools software',
    'organic balloons software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and designs' },
    { id: 'admin', name: 'Artist Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Lead Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'assistant', name: 'Design Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a balloon decor platform',
    'Create a balloon artist portal',
    'I need a balloon decoration management system',
    'Build a design gallery platform',
    'Create an order and delivery scheduling app',
  ],
};
