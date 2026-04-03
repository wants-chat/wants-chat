/**
 * Invoice Factoring App Type Definition
 *
 * Complete definition for invoice factoring company operations.
 * Essential for factoring companies, invoice financing, and AR financing firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVOICE_FACTORING_APP_TYPE: AppTypeDefinition = {
  id: 'invoice-factoring',
  name: 'Invoice Factoring',
  category: 'finance',
  description: 'Invoice factoring platform with client onboarding, invoice verification, funding management, and collections',
  icon: 'receipt',

  keywords: [
    'invoice factoring',
    'factoring company',
    'invoice factoring software',
    'invoice financing',
    'ar financing',
    'invoice factoring management',
    'client onboarding',
    'invoice factoring practice',
    'invoice factoring scheduling',
    'invoice verification',
    'invoice factoring crm',
    'funding management',
    'invoice factoring business',
    'collections',
    'invoice factoring pos',
    'debtor management',
    'invoice factoring operations',
    'advance rates',
    'invoice factoring platform',
    'reserve release',
  ],

  synonyms: [
    'invoice factoring platform',
    'invoice factoring software',
    'factoring company software',
    'invoice financing software',
    'ar financing software',
    'client onboarding software',
    'invoice factoring practice software',
    'invoice verification software',
    'funding management software',
    'collections software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Invoices and funding' },
    { id: 'admin', name: 'Factor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and funding' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'underwriter', name: 'Underwriter', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/applications' },
    { id: 'collector', name: 'Collections Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/collections' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an invoice factoring platform',
    'Create a factoring company portal',
    'I need an AR financing system',
    'Build an invoice and funding platform',
    'Create a collections management app',
  ],
};
