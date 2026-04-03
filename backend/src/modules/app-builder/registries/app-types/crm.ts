/**
 * CRM App Type Definition
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRM_APP_TYPE: AppTypeDefinition = {
  id: 'crm',
  name: 'CRM System',
  category: 'business',
  description: 'Customer relationship management with leads, contacts, and deals',
  icon: 'users',

  keywords: [
    'crm', 'customer', 'lead', 'contact', 'deal', 'pipeline',
    'sales', 'relationship', 'management', 'prospect',
  ],

  synonyms: [
    'customer management', 'sales crm', 'lead management',
    'customer relationship', 'sales pipeline',
  ],

  negativeKeywords: ['blog', 'store', 'booking'],

  sections: [
    {
      id: 'admin',
      name: 'CRM Dashboard',
      enabled: true,
      basePath: '/',
      requiredRole: 'user',
      layout: 'admin',
      description: 'Main CRM interface',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'manager',
      name: 'Sales Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'user',
      name: 'Sales Rep',
      level: 30,
      isDefault: true,
      accessibleSections: ['admin'],
      defaultRoute: '/dashboard',
    },
  ],

  defaultFeatures: [
    'user-auth',
    'crm',
    'dashboard',
    'search',
    'analytics',
  ],

  optionalFeatures: [
    'email',
    'calendar',
    'reporting',
    'tasks',
    'documents',
    'file-upload',
    'notifications',
    'clients',
    'workflow',
  ],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'business',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a CRM for my sales team',
    'Create a customer management system',
    'I need a lead tracking application',
    'Build a sales pipeline tool',
  ],
};
