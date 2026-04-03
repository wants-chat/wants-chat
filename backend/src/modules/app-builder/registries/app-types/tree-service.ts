/**
 * Tree Service App Type Definition
 *
 * Complete definition for tree service companies and arborists.
 * Essential for tree care companies, arborists, and landscaping businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'tree-service',
  name: 'Tree Service',
  category: 'environmental',
  description: 'Tree service platform with job estimates, crew scheduling, equipment tracking, and customer management',
  icon: 'tree-pine',

  keywords: [
    'tree service',
    'arborist services',
    'tree service software',
    'tree removal',
    'tree trimming',
    'tree service management',
    'job estimates',
    'tree service practice',
    'tree service scheduling',
    'crew scheduling',
    'tree service crm',
    'stump grinding',
    'tree service business',
    'tree health',
    'tree service pos',
    'pruning services',
    'tree service operations',
    'storm damage',
    'tree service platform',
    'emergency tree',
  ],

  synonyms: [
    'tree service platform',
    'tree service software',
    'arborist services software',
    'tree removal software',
    'tree trimming software',
    'job estimates software',
    'tree service practice software',
    'crew scheduling software',
    'stump grinding software',
    'pruning services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and quotes' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Crews and jobs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'arborist', name: 'Lead Arborist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
    'daily-logs',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
    'project-bids',
    'site-safety',
    'material-takeoffs',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a tree service platform',
    'Create an arborist services portal',
    'I need a tree care management system',
    'Build a tree removal business platform',
    'Create a crew scheduling and job tracking app',
  ],
};
