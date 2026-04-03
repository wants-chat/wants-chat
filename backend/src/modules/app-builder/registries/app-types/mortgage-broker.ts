/**
 * Mortgage Broker App Type Definition
 *
 * Complete definition for mortgage brokerage operations.
 * Essential for mortgage brokers, loan officers, and lending companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MORTGAGE_BROKER_APP_TYPE: AppTypeDefinition = {
  id: 'mortgage-broker',
  name: 'Mortgage Broker',
  category: 'finance',
  description: 'Mortgage broker platform with loan origination, rate comparison, document collection, and pipeline management',
  icon: 'home',

  keywords: [
    'mortgage broker',
    'mortgage brokerage',
    'mortgage broker software',
    'loan officer',
    'lending company',
    'mortgage broker management',
    'loan origination',
    'mortgage broker practice',
    'mortgage broker scheduling',
    'rate comparison',
    'mortgage broker crm',
    'document collection',
    'mortgage broker business',
    'pipeline management',
    'mortgage broker pos',
    'pre-approval',
    'mortgage broker operations',
    'closing coordination',
    'mortgage broker platform',
    'refinancing',
  ],

  synonyms: [
    'mortgage broker platform',
    'mortgage broker software',
    'mortgage brokerage software',
    'loan officer software',
    'lending company software',
    'loan origination software',
    'mortgage broker practice software',
    'rate comparison software',
    'document collection software',
    'pipeline management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Applications and rates' },
    { id: 'admin', name: 'Broker Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Loans and pipeline' },
  ],

  roles: [
    { id: 'admin', name: 'Broker Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'officer', name: 'Loan Officer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/loans' },
    { id: 'processor', name: 'Loan Processor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'borrower', name: 'Borrower', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a mortgage broker platform',
    'Create a loan origination portal',
    'I need a mortgage pipeline system',
    'Build a rate comparison platform',
    'Create a loan processing app',
  ],
};
