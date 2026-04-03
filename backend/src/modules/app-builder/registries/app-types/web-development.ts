/**
 * Web Development App Type Definition
 *
 * Complete definition for web development agencies and freelancers.
 * Essential for web agencies, digital studios, and freelance developers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEB_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'web-development',
  name: 'Web Development Agency',
  category: 'technology',
  description: 'Web development platform with project management, client portals, milestone tracking, and portfolio showcase',
  icon: 'code',

  keywords: [
    'web development',
    'digital agency',
    'web development software',
    'website design',
    'web agency',
    'web development management',
    'project management',
    'web development practice',
    'web development scheduling',
    'client portals',
    'web development crm',
    'frontend development',
    'web development business',
    'backend development',
    'web development pos',
    'responsive design',
    'web development operations',
    'cms development',
    'web development services',
    'full stack',
  ],

  synonyms: [
    'web development platform',
    'web development software',
    'digital agency software',
    'website design software',
    'web agency software',
    'project management software',
    'web development practice software',
    'client portals software',
    'frontend development software',
    'full stack software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and updates' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Team and projects' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Tech Lead', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'developer', name: 'Developer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a web development agency platform',
    'Create a digital studio portal',
    'I need a web agency management system',
    'Build a freelance developer platform',
    'Create a client project and portfolio app',
  ],
};
