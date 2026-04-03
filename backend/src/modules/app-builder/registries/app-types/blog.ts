/**
 * Blog Platform App Type Definition
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BLOG_APP_TYPE: AppTypeDefinition = {
  id: 'blog',
  name: 'Blog Platform',
  category: 'content',
  description: 'Content publishing platform with articles, categories, and comments',
  icon: 'edit-3',

  keywords: [
    'blog', 'article', 'post', 'publish', 'content', 'writing',
    'news', 'magazine', 'editorial', 'author', 'cms',
  ],

  synonyms: [
    'blogging platform', 'content site', 'news site',
    'article website', 'publishing platform',
  ],

  negativeKeywords: ['store', 'shop', 'cart', 'checkout', 'payment'],

  sections: [
    {
      id: 'frontend',
      name: 'Blog',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public blog for readers',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Content management for authors and admins',
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
      id: 'author',
      name: 'Author',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/posts',
    },
    {
      id: 'reader',
      name: 'Reader',
      level: 10,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  defaultFeatures: [
    'landing-page',
    'user-auth',
    'blog',
    'categories',
    'comments',
    'search',
  ],

  optionalFeatures: [
    'notifications',
    'analytics',
    'tags',
    'media',
    'file-upload',
    'dashboard',
  ],

  requiresAuth: true, // Public blog doesn't require auth to read
  requiresPayment: false,
  multiTenant: false,
  complexity: 'medium',
  industry: 'media',

  // Landing page is public - both guests and authenticated users see it
  defaultRoute: '/',
  guestRoute: '/',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a blog for tech articles',
    'Create a news website',
    'I want a platform to publish articles',
    'Build a content publishing site',
  ],

  // Landing page components for blog
  landingPageComponents: [
    'hero-section',
    'featured-posts',
    'recent-posts-grid',
    'category-list',
    'newsletter-signup',
    'author-spotlight',
    'cta-block',
  ],
};
