/**
 * SaaS Platform App Type Definition
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAAS_APP_TYPE: AppTypeDefinition = {
  id: 'saas',
  name: 'SaaS Platform',
  category: 'business',
  description: 'Software as a Service platform with subscriptions and multi-tenancy',
  icon: 'cloud',

  keywords: [
    'saas', 'software', 'service', 'subscription', 'platform',
    'cloud', 'multi-tenant', 'b2b', 'enterprise',
  ],

  synonyms: [
    'software platform', 'cloud service', 'subscription service',
    'web application', 'online software',
  ],

  negativeKeywords: ['blog', 'store', 'booking'],

  sections: [
    {
      id: 'frontend',
      name: 'Landing',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public marketing site',
    },
    {
      id: 'admin',
      name: 'Dashboard',
      enabled: true,
      basePath: '/app',
      requiredRole: 'user',
      layout: 'admin',
      description: 'Main application dashboard',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/app/dashboard',
    },
    {
      id: 'user',
      name: 'User',
      level: 30,
      isDefault: true,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/app/dashboard',
    },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'payments',
    'team-management',
    'settings',
    'dashboard',
  ],

  optionalFeatures: [
    'analytics',
    'notifications',
    'invoicing',
    'reporting',
    'workflow',
    'file-upload',
  ],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a SaaS platform',
    'Create a subscription-based software',
    'I need a multi-tenant application',
    'Build a cloud-based service',
  ],
};
