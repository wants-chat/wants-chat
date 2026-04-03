/**
 * Digital Signage App Type Definition
 *
 * Complete definition for digital signage providers and display solutions.
 * Essential for digital signage companies, display networks, and content providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIGITAL_SIGNAGE_APP_TYPE: AppTypeDefinition = {
  id: 'digital-signage',
  name: 'Digital Signage Provider',
  category: 'technology',
  description: 'Digital signage platform with content management, display networks, scheduling, and remote monitoring',
  icon: 'monitor',

  keywords: [
    'digital signage',
    'display solutions',
    'digital signage software',
    'screen management',
    'content management',
    'digital signage management',
    'content scheduling',
    'digital signage practice',
    'digital signage scheduling',
    'display networks',
    'digital signage crm',
    'video walls',
    'digital signage business',
    'interactive kiosks',
    'digital signage pos',
    'menu boards',
    'digital signage operations',
    'outdoor displays',
    'digital signage services',
    'wayfinding',
  ],

  synonyms: [
    'digital signage platform',
    'digital signage software',
    'display solutions software',
    'screen management software',
    'content management software',
    'content scheduling software',
    'digital signage practice software',
    'display networks software',
    'video walls software',
    'interactive kiosks software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Displays and content' },
    { id: 'admin', name: 'Provider Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Networks and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Provider Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Network Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/displays' },
    { id: 'content', name: 'Content Manager', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/content' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'blog',
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

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a digital signage provider platform',
    'Create a display solutions portal',
    'I need a screen management system',
    'Build a content scheduling platform',
    'Create a digital signage and display network app',
  ],
};
