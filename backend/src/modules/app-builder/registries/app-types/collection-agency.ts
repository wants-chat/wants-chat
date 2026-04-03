/**
 * Collection Agency App Type Definition
 *
 * Complete definition for debt collection agency operations.
 * Essential for collection agencies, debt buyers, and recovery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COLLECTION_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'collection-agency',
  name: 'Collection Agency',
  category: 'finance',
  description: 'Collection agency platform with account management, debtor communication, payment processing, and compliance tracking',
  icon: 'phone-call',

  keywords: [
    'collection agency',
    'debt collection',
    'collection agency software',
    'debt buyer',
    'recovery services',
    'collection agency management',
    'account management',
    'collection agency practice',
    'collection agency scheduling',
    'debtor communication',
    'collection agency crm',
    'payment processing',
    'collection agency business',
    'compliance tracking',
    'collection agency pos',
    'skip tracing',
    'collection agency operations',
    'payment plans',
    'collection agency platform',
    'fdcpa compliance',
  ],

  synonyms: [
    'collection agency platform',
    'collection agency software',
    'debt collection software',
    'debt buyer software',
    'recovery services software',
    'account management software',
    'collection agency practice software',
    'debtor communication software',
    'payment processing software',
    'skip tracing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Debtor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Accounts and payments' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Accounts and agents' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Collection Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/accounts' },
    { id: 'collector', name: 'Collection Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'debtor', name: 'Debtor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a collection agency platform',
    'Create a debt collection portal',
    'I need a collection management system',
    'Build a debtor communication platform',
    'Create a payment and compliance app',
  ],
};
