/**
 * Newsletter & Email Marketing App Type Definition
 *
 * Complete definition for newsletter and email marketing applications.
 * Essential for content creators, businesses, and marketers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEWSLETTER_APP_TYPE: AppTypeDefinition = {
  id: 'newsletter',
  name: 'Newsletter & Email Marketing',
  category: 'marketing',
  description: 'Newsletter platform with email campaigns, subscriber management, and analytics',
  icon: 'envelope',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'newsletter',
    'email marketing',
    'email campaign',
    'email list',
    'mailing list',
    'subscriber',
    'subscribers',
    'mailchimp',
    'convertkit',
    'substack',
    'beehiiv',
    'buttondown',
    'revue',
    'ghost newsletter',
    'email automation',
    'drip campaign',
    'email blast',
    'broadcast',
    'email platform',
    'newsletter platform',
    'subscriber management',
    'email builder',
    'campaign manager',
    'marketing email',
    'bulk email',
    'email newsletter',
  ],

  synonyms: [
    'email platform',
    'newsletter platform',
    'email service',
    'newsletter service',
    'email marketing platform',
    'subscriber platform',
    'mailing platform',
    'email sender',
    'newsletter sender',
    'email tool',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'ecommerce only',
    'transactional email',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Public Pages',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public subscription and archive pages',
    },
    {
      id: 'admin',
      name: 'Publisher Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'publisher',
      layout: 'admin',
      description: 'Newsletter creation and subscriber management',
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
      id: 'publisher',
      name: 'Publisher',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/campaigns',
    },
    {
      id: 'editor',
      name: 'Editor',
      level: 30,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/drafts',
    },
    {
      id: 'subscriber',
      name: 'Subscriber',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/archive',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'tags',
    'workflow',
    'analytics',
    'file-upload',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'inventory',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marketing',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a newsletter platform',
    'Create an email marketing app like Mailchimp',
    'I need a newsletter tool like Substack',
    'Build a subscriber management system',
    'Create an email campaign platform',
    'I want to build a newsletter service',
    'Make a newsletter app with paid subscriptions',
  ],
};
