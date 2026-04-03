/**
 * Affiliate Marketing App Type Definition
 *
 * Complete definition for affiliate marketing and referral program applications.
 * Essential for affiliate networks, referral programs, and partnership marketing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AFFILIATE_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'affiliate-marketing',
  name: 'Affiliate Marketing',
  category: 'marketing',
  description: 'Affiliate marketing platform with partner management, tracking, commission payouts, and performance analytics',
  icon: 'users-round',

  keywords: [
    'affiliate marketing',
    'affiliate program',
    'referral program',
    'affiliate network',
    'partner program',
    'commission tracking',
    'affiliate links',
    'referral links',
    'affiliate management',
    'shareasale',
    'impact',
    'cj affiliate',
    'influencer affiliate',
    'affiliate payout',
    'affiliate tracking',
    'performance marketing',
    'affiliate dashboard',
    'referral tracking',
    'mlm',
    'ambassador program',
    'brand partners',
  ],

  synonyms: [
    'affiliate marketing platform',
    'affiliate software',
    'referral program software',
    'affiliate management software',
    'partner program platform',
    'affiliate tracking software',
    'commission management',
    'affiliate network software',
    'referral marketing app',
    'affiliate program app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Affiliate Portal', enabled: true, basePath: '/', layout: 'public', description: 'Join and manage affiliate account' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Affiliates and commissions' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Affiliate Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/affiliates' },
    { id: 'merchant', name: 'Merchant', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'affiliate', name: 'Affiliate', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'booking-system'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'marketing',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an affiliate marketing platform',
    'Create a referral program system',
    'I need an affiliate management dashboard',
    'Build a partner program like ShareASale',
    'Create an affiliate tracking platform',
  ],
};
