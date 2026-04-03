/**
 * Coworking Space App Type Definition
 *
 * Complete definition for coworking space and shared workspace applications.
 * Essential for coworking operators, flexible offices, and workspace providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COWORKING_APP_TYPE: AppTypeDefinition = {
  id: 'coworking',
  name: 'Coworking Space',
  category: 'real-estate',
  description: 'Coworking platform with space booking, membership management, community features, and access control',
  icon: 'building-user',

  keywords: [
    'coworking',
    'coworking space',
    'shared workspace',
    'flexible office',
    'hot desk',
    'wework',
    'regus',
    'industrious',
    'spaces',
    'workspace',
    'office rental',
    'meeting room',
    'private office',
    'desk booking',
    'workspace booking',
    'office space',
    'business center',
    'executive suite',
    'virtual office',
    'community workspace',
    'innovation hub',
    'startup space',
  ],

  synonyms: [
    'coworking platform',
    'coworking software',
    'workspace management',
    'shared office app',
    'flexible workspace',
    'coworking app',
    'workspace booking system',
    'office space platform',
    'desk reservation system',
    'coworking management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Member booking and community' },
    { id: 'admin', name: 'Operator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Space and member management' },
  ],

  roles: [
    { id: 'admin', name: 'Space Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Community Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'calendar',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'check-in',
    'invoicing',
    'contracts',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a coworking space management platform',
    'Create a desk booking system like WeWork',
    'I need a shared workspace booking app',
    'Build a coworking membership platform',
    'Create a flexible office space management system',
  ],
};
