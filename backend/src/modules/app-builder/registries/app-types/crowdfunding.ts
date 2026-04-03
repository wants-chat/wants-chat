/**
 * Crowdfunding App Type Definition
 *
 * Complete definition for crowdfunding and campaign funding applications.
 * Essential for crowdfunding platforms, fundraising campaigns, and startup funding.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CROWDFUNDING_APP_TYPE: AppTypeDefinition = {
  id: 'crowdfunding',
  name: 'Crowdfunding',
  category: 'finance',
  description: 'Crowdfunding platform with campaign creation, reward tiers, backer management, and fund disbursement',
  icon: 'hand-coins',

  keywords: [
    'crowdfunding',
    'kickstarter',
    'indiegogo',
    'gofundme',
    'campaign funding',
    'fundraising',
    'startup funding',
    'project funding',
    'reward crowdfunding',
    'equity crowdfunding',
    'donation crowdfunding',
    'backers',
    'pledge',
    'campaign',
    'funding goal',
    'stretch goals',
    'reward tiers',
    'early bird',
    'creator',
    'project launch',
    'funding platform',
  ],

  synonyms: [
    'crowdfunding platform',
    'crowdfunding software',
    'fundraising platform',
    'campaign funding software',
    'crowdfunding website builder',
    'project funding platform',
    'backer management software',
    'crowdfunding app',
    'funding campaign platform',
    'startup funding platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Campaign Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and back campaigns' },
    { id: 'admin', name: 'Creator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'creator', layout: 'admin', description: 'Manage campaigns and backers' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'reviewer', name: 'Campaign Reviewer', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/review' },
    { id: 'creator', name: 'Campaign Creator', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/campaigns' },
    { id: 'backer', name: 'Backer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a crowdfunding platform',
    'Create a Kickstarter-style funding site',
    'I need a campaign funding platform',
    'Build a reward-based crowdfunding app',
    'Create a project funding marketplace',
  ],
};
