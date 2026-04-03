/**
 * Financial Advisory App Type Definition
 *
 * Complete definition for financial advisory and wealth management firms.
 * Essential for investment advice, financial planning, and wealth management services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FINANCIAL_ADVISORY_APP_TYPE: AppTypeDefinition = {
  id: 'financial-advisory',
  name: 'Financial Advisory',
  category: 'finance',
  description: 'Financial advisory platform with portfolio management, financial planning, investment tracking, and client wealth reporting',
  icon: 'trending-up',

  keywords: [
    'financial advisory',
    'wealth management',
    'financial advisory software',
    'investment advice',
    'financial planning',
    'financial advisory management',
    'portfolio management',
    'financial advisory practice',
    'financial advisory scheduling',
    'retirement planning',
    'financial advisory crm',
    'asset management',
    'financial advisory business',
    'tax planning',
    'financial advisory pos',
    'estate planning',
    'financial advisory operations',
    'risk management',
    'financial advisory services',
    'wealth advisor',
  ],

  synonyms: [
    'financial advisory platform',
    'financial advisory software',
    'wealth management software',
    'investment advice software',
    'financial planning software',
    'portfolio management software',
    'financial advisory practice software',
    'retirement planning software',
    'asset management software',
    'wealth advisor software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Portfolio and reports' },
    { id: 'admin', name: 'Advisory Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and portfolios' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'advisor', name: 'Financial Advisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'analyst', name: 'Financial Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/portfolios' },
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

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a financial advisory platform',
    'Create a wealth management client portal',
    'I need an investment advisory system',
    'Build a financial planning practice platform',
    'Create a portfolio management app',
  ],
};
