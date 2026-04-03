/**
 * Mailbox Rental App Type Definition
 *
 * Complete definition for mailbox rental and shipping operations.
 * Essential for mailbox stores, pack and ship services, and postal centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MAILBOX_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'mailbox-rental',
  name: 'Mailbox Rental',
  category: 'services',
  description: 'Mailbox rental platform with box management, package notification, shipping services, and recurring billing',
  icon: 'mail',

  keywords: [
    'mailbox rental',
    'pack and ship',
    'mailbox rental software',
    'postal center',
    'business mailbox',
    'mailbox rental management',
    'box management',
    'mailbox rental practice',
    'mailbox rental scheduling',
    'package notification',
    'mailbox rental crm',
    'shipping services',
    'mailbox rental business',
    'recurring billing',
    'mailbox rental pos',
    'mail forwarding',
    'mailbox rental operations',
    'notary services',
    'mailbox rental platform',
    'virtual office',
  ],

  synonyms: [
    'mailbox rental platform',
    'mailbox rental software',
    'pack and ship software',
    'postal center software',
    'business mailbox software',
    'box management software',
    'mailbox rental practice software',
    'package notification software',
    'shipping services software',
    'mail forwarding software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Mailbox and packages' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Boxes and services' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/boxes' },
    { id: 'staff', name: 'Counter Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/packages' },
    { id: 'customer', name: 'Box Holder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a mailbox rental platform',
    'Create a pack and ship store app',
    'I need a postal center system',
    'Build a mailbox store management app',
    'Create a mail services portal',
  ],
};
