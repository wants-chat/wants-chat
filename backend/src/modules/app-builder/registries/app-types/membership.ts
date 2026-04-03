/**
 * Membership & Subscription App Type Definition
 *
 * Complete definition for membership and subscription-based applications.
 * Essential for content creators, communities, and subscription businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEMBERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'membership',
  name: 'Membership & Subscription',
  category: 'business',
  description: 'Membership site with subscription plans, gated content, and member management',
  icon: 'id-card',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'membership',
    'membership site',
    'subscription',
    'subscription site',
    'subscription box',
    'patreon',
    'substack',
    'memberful',
    'gated content',
    'premium content',
    'exclusive content',
    'member portal',
    'member area',
    'membership platform',
    'subscription platform',
    'recurring payments',
    'subscriber management',
    'member management',
    'community membership',
    'paid community',
    'content monetization',
    'creator platform',
    'fan club',
    'patron',
    'supporter',
    'tier system',
    'access levels',
    'drip content',
  ],

  synonyms: [
    'subscription service',
    'membership service',
    'member platform',
    'subscriber platform',
    'paid membership',
    'premium membership',
    'exclusive membership',
    'members only',
    'subscription management',
    'recurring billing platform',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'landing page',
    'ecommerce only',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Member Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public-facing site with member-only content areas',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Membership and content management',
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
      id: 'creator',
      name: 'Content Creator',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/content',
    },
    {
      id: 'premium',
      name: 'Premium Member',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'member',
      name: 'Basic Member',
      level: 30,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'free',
      name: 'Free Member',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'subscriptions',
    'analytics',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: false,
  complexity: 'moderate',
  industry: 'media',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a membership site',
    'Create a subscription platform like Patreon',
    'I need a gated content platform',
    'Build a paid community site',
    'Create a membership app with subscription tiers',
    'I want to build a premium content platform',
    'Make a membership site for my online community',
  ],
};
