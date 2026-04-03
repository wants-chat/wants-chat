/**
 * App Development App Type Definition
 *
 * Complete definition for app development companies and mobile studios.
 * Essential for app agencies, mobile developers, and software houses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APP_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'app-development',
  name: 'App Development Studio',
  category: 'technology',
  description: 'App development platform with sprint management, beta testing, app store submissions, and client feedback',
  icon: 'smartphone',

  keywords: [
    'app development',
    'mobile development',
    'app development software',
    'ios development',
    'android development',
    'app development management',
    'sprint management',
    'app development practice',
    'app development scheduling',
    'beta testing',
    'app development crm',
    'cross-platform',
    'app development business',
    'react native',
    'app development pos',
    'flutter development',
    'app development operations',
    'app store',
    'app development services',
    'mobile apps',
  ],

  synonyms: [
    'app development platform',
    'app development software',
    'mobile development software',
    'ios development software',
    'android development software',
    'sprint management software',
    'app development practice software',
    'beta testing software',
    'cross-platform software',
    'mobile apps software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Apps and releases' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Team and sprints' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Mobile Lead', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'developer', name: 'Mobile Developer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sprints' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'announcements',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an app development studio platform',
    'Create a mobile development portal',
    'I need an app agency management system',
    'Build a software house platform',
    'Create an app development and beta testing app',
  ],
};
