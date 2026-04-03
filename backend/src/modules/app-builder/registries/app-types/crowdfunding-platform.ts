/**
 * Crowdfunding Platform App Type Definition
 *
 * Complete definition for crowdfunding platform operations.
 * Essential for crowdfunding sites, reward platforms, and equity crowdfunding.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CROWDFUNDING_PLATFORM_APP_TYPE: AppTypeDefinition = {
  id: 'crowdfunding-platform',
  name: 'Crowdfunding Platform',
  category: 'finance',
  description: 'Crowdfunding platform with campaign creation, backer management, payment processing, and reward fulfillment',
  icon: 'hand-coins',

  keywords: [
    'crowdfunding platform',
    'crowdfunding',
    'crowdfunding platform software',
    'reward crowdfunding',
    'equity crowdfunding',
    'crowdfunding platform management',
    'campaign creation',
    'crowdfunding platform practice',
    'crowdfunding platform scheduling',
    'backer management',
    'crowdfunding platform crm',
    'payment processing',
    'crowdfunding platform business',
    'reward fulfillment',
    'crowdfunding platform pos',
    'fundraising',
    'crowdfunding platform operations',
    'stretch goals',
    'crowdfunding platform app',
    'campaign updates',
  ],

  synonyms: [
    'crowdfunding platform app',
    'crowdfunding platform software',
    'crowdfunding software',
    'reward crowdfunding software',
    'equity crowdfunding software',
    'campaign creation software',
    'crowdfunding platform practice software',
    'backer management software',
    'payment processing software',
    'fundraising software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Backer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Campaigns and pledges' },
    { id: 'admin', name: 'Platform Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Campaigns and creators' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'creator', name: 'Campaign Creator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/campaigns' },
    { id: 'support', name: 'Support Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'backer', name: 'Backer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a crowdfunding platform',
    'Create a reward crowdfunding portal',
    'I need a crowdfunding management system',
    'Build a campaign and backer platform',
    'Create a fundraising app',
  ],
};
