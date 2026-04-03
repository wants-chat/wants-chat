/**
 * Donation & Fundraising App Type Definition
 *
 * Complete definition for donation and fundraising applications.
 * Essential for nonprofits, charities, and crowdfunding campaigns.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FUNDRAISING_APP_TYPE: AppTypeDefinition = {
  id: 'fundraising',
  name: 'Donation & Fundraising',
  category: 'nonprofit',
  description: 'Fundraising platform with donation pages, campaigns, recurring giving, and donor management',
  icon: 'hand-holding-heart',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'donation',
    'donations',
    'fundraising',
    'crowdfunding',
    'charity',
    'nonprofit',
    'non-profit',
    'giving',
    'donate',
    'donor',
    'donors',
    'gofundme',
    'kickstarter',
    'indiegogo',
    'patreon',
    'ko-fi',
    'buy me a coffee',
    'campaign',
    'fundraiser',
    'donation page',
    'giving page',
    'donor management',
    'pledge',
    'contribution',
    'philanthropy',
    'cause',
    'charity platform',
    'grant',
  ],

  synonyms: [
    'giving platform',
    'donation platform',
    'fundraising platform',
    'charity platform',
    'crowdfunding platform',
    'donor portal',
    'giving app',
    'donation app',
    'fundraiser app',
    'nonprofit platform',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'social media',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Donation Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public donation and campaign pages',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'organizer',
      layout: 'admin',
      description: 'Campaign management and donor tracking',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'organizer',
      name: 'Campaign Organizer',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/campaigns',
    },
    {
      id: 'donor',
      name: 'Donor',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/campaigns',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'analytics',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'inventory',
    'course-management',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'nonprofit',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'green',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a donation platform',
    'Create a fundraising app like GoFundMe',
    'I need a donation page for my nonprofit',
    'Build a crowdfunding platform',
    'Create a charity donation system',
    'I want to build a giving platform',
    'Make a fundraising app with recurring donations',
  ],
};
