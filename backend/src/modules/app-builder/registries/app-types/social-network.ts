/**
 * Social Network & Community App Type Definition
 *
 * Complete definition for social networking and community applications.
 * Essential for online communities, forums, and social platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCIAL_NETWORK_APP_TYPE: AppTypeDefinition = {
  id: 'social-network',
  name: 'Social Network & Community',
  category: 'social',
  description: 'Social networking platform with profiles, posts, groups, messaging, and activity feeds',icon: 'users',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'social network',
    'social networking',
    'social media',
    'community',
    'online community',
    'forum',
    'discussion forum',
    'social platform',
    'facebook',
    'twitter',
    'linkedin',
    'reddit',
    'discord',
    'slack community',
    'circle',
    'mighty networks',
    'tribe',
    'user profiles',
    'news feed',
    'activity feed',
    'social feed',
    'friends',
    'followers',
    'following',
    'groups',
    'posts',
    'comments',
    'likes',
    'reactions',
    'messaging',
    'chat',
  ],

  synonyms: [
    'social network',
    'social networking',
    'community platform',
    'social app',
    'networking platform',
    'community app',
    'social site',
    'community site',
    'user community',
    'online forum',
    'discussion platform',
    'member community',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'ecommerce only',
    'landing page',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Community',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Main community interface for members'
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Community administration and moderation'
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard'
    },
    {
      id: 'moderator',
      name: 'Moderator',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/reports'
    },
    {
      id: 'verified',
      name: 'Verified Member',
      level: 40,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/feed'
    },
    {
      id: 'member',
      name: 'Member',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/feed'
    },
    {
      id: 'guest',
      name: 'Guest',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/'
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'landing-page',
    'user-auth',
    'social-feed',
    'notifications',
    'search',
    'messaging',
  ],

  optionalFeatures: [
    'analytics',
    'announcements',
    'media',
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
  requiresPayment: false,
  multiTenant: false,
  complexity: 'complex',
  industry: 'social',

  // Default route for authenticated users - go to feed
  defaultRoute: '/feed',
  // Guest users see landing page first
  guestRoute: '/',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a social networking platform',
    'Create an online community',
    'I need a community forum app',
    'Build a platform like Facebook for my niche',
    'Create a social app with groups and messaging',
    'I want to build a community platform',
    'Make a social network for professionals',
  ],

  // Landing page components for social network
  landingPageComponents: [
    'hero-section',
    'feature-showcase-grid',
    'testimonial-grid',
    'partner-client-logos',
    'newsletter-signup',
    'cta-block',
  ],
};
