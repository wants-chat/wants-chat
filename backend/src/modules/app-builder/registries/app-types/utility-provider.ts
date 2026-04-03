/**
 * Utility Provider App Type Definition
 *
 * Complete definition for utility provider and utility management applications.
 * Essential for water, electric, gas utilities, and municipal utility districts.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UTILITY_PROVIDER_APP_TYPE: AppTypeDefinition = {
  id: 'utility-provider',
  name: 'Utility Provider',
  category: 'government',
  description: 'Utility platform with billing management, usage tracking, outage reporting, and customer portal',
  icon: 'zap',

  keywords: [
    'utility provider',
    'utility billing',
    'water utility',
    'electric utility',
    'gas utility',
    'utility company',
    'utility management',
    'utility customer',
    'utility account',
    'utility payments',
    'utility meter',
    'utility usage',
    'outage reporting',
    'utility services',
    'municipal utility',
    'public utility',
    'utility portal',
    'energy provider',
    'utility district',
    'utility software',
  ],

  synonyms: [
    'utility provider platform',
    'utility billing software',
    'utility management software',
    'utility customer software',
    'utility company software',
    'water utility software',
    'electric utility software',
    'utility portal software',
    'utility account software',
    'public utility platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'utility class programming'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Billing and services' },
    { id: 'admin', name: 'Utility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Accounts and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Utility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/accounts' },
    { id: 'staff', name: 'Customer Service', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'technician', name: 'Field Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/work-orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a utility provider platform',
    'Create a water utility billing system',
    'I need a utility customer portal',
    'Build an electric utility management app',
    'Create a utility company platform',
  ],
};
