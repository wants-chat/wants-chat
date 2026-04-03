/**
 * Loyalty Program App Type Definition
 *
 * Complete definition for loyalty program and rewards applications.
 * Essential for customer loyalty, rewards programs, and points systems.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOYALTY_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'loyalty-program',
  name: 'Loyalty Program',
  category: 'marketing',
  description: 'Loyalty program platform with points earning, rewards redemption, tier management, and member engagement',
  icon: 'star',

  keywords: [
    'loyalty program',
    'rewards program',
    'points program',
    'customer loyalty',
    'loyalty app',
    'reward points',
    'member rewards',
    'loyalty card',
    'digital punch card',
    'cashback rewards',
    'tier rewards',
    'vip program',
    'loyalty platform',
    'customer retention',
    'repeat customers',
    'loyalty marketing',
    'reward redemption',
    'loyalty tiers',
    'member benefits',
    'earn and burn',
    'loyalty engagement',
  ],

  synonyms: [
    'loyalty program platform',
    'loyalty software',
    'rewards program software',
    'loyalty management system',
    'points program platform',
    'customer loyalty app',
    'rewards platform',
    'loyalty program app',
    'member rewards software',
    'loyalty engagement platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant delivery', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Earn and redeem rewards' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Program and members' },
  ],

  roles: [
    { id: 'admin', name: 'Program Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'partner', name: 'Partner/Merchant', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/transactions' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/redeem' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'announcements',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marketing',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a customer loyalty program',
    'Create a rewards points platform',
    'I need a loyalty program management system',
    'Build a member rewards app',
    'Create a digital punch card system',
  ],
};
