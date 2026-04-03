/**
 * Software Development App Type Definition
 *
 * Complete definition for software development agency operations.
 * Essential for dev agencies, software consultancies, and IT solution providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTWARE_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'software-development',
  name: 'Software Development',
  category: 'services',
  description: 'Software development platform with project management, client portals, time tracking, and milestone billing',
  icon: 'code',

  keywords: [
    'software development',
    'dev agency',
    'software development software',
    'software consultancy',
    'it solutions',
    'software development management',
    'project management',
    'software development practice',
    'software development scheduling',
    'client portals',
    'software development crm',
    'time tracking',
    'software development business',
    'milestone billing',
    'software development pos',
    'custom software',
    'software development operations',
    'app development',
    'software development platform',
    'agile development',
  ],

  synonyms: [
    'software development platform',
    'software development software',
    'dev agency software',
    'software consultancy software',
    'it solutions software',
    'project management software',
    'software development practice software',
    'client portals software',
    'time tracking software',
    'app development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and updates' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and team' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pm', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'developer', name: 'Developer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'time-tracking',
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
  industry: 'services',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a software development platform',
    'Create a dev agency portal',
    'I need a software development management system',
    'Build a project and client platform',
    'Create a time tracking and billing app',
  ],
};
