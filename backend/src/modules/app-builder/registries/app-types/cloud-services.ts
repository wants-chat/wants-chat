/**
 * Cloud Services App Type Definition
 *
 * Complete definition for cloud service providers and hosting companies.
 * Essential for cloud providers, hosting services, and infrastructure companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLOUD_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'cloud-services',
  name: 'Cloud Services Provider',
  category: 'technology',
  description: 'Cloud services platform with resource provisioning, usage monitoring, billing management, and support tickets',
  icon: 'cloud',

  keywords: [
    'cloud services',
    'hosting provider',
    'cloud services software',
    'web hosting',
    'cloud infrastructure',
    'cloud services management',
    'resource provisioning',
    'cloud services practice',
    'cloud services scheduling',
    'usage monitoring',
    'cloud services crm',
    'saas hosting',
    'cloud services business',
    'virtual servers',
    'cloud services pos',
    'cloud storage',
    'cloud services operations',
    'managed hosting',
    'cloud services platform',
    'iaas',
  ],

  synonyms: [
    'cloud services platform',
    'cloud services software',
    'hosting provider software',
    'web hosting software',
    'cloud infrastructure software',
    'resource provisioning software',
    'cloud services practice software',
    'usage monitoring software',
    'virtual servers software',
    'managed hosting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and billing' },
    { id: 'admin', name: 'Provider Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Infrastructure and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Cloud Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Cloud Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/infrastructure' },
    { id: 'support', name: 'Support Engineer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'support-tickets',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a cloud services platform',
    'Create a hosting provider portal',
    'I need a cloud infrastructure management system',
    'Build a web hosting business platform',
    'Create a cloud provisioning and billing app',
  ],
};
