/**
 * Credit Union App Type Definition
 *
 * Complete definition for credit union operations.
 * Essential for credit unions, member-owned banks, and cooperative financial institutions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CREDIT_UNION_APP_TYPE: AppTypeDefinition = {
  id: 'credit-union',
  name: 'Credit Union',
  category: 'finance',
  description: 'Credit union platform with member services, account management, loan processing, and mobile banking',
  icon: 'landmark',

  keywords: [
    'credit union',
    'member bank',
    'credit union software',
    'cooperative bank',
    'community bank',
    'credit union management',
    'member services',
    'credit union practice',
    'credit union scheduling',
    'account management',
    'credit union crm',
    'loan processing',
    'credit union business',
    'mobile banking',
    'credit union pos',
    'share accounts',
    'credit union operations',
    'member loans',
    'credit union platform',
    'atm network',
  ],

  synonyms: [
    'credit union platform',
    'credit union software',
    'member bank software',
    'cooperative bank software',
    'community bank software',
    'member services software',
    'credit union practice software',
    'account management software',
    'loan processing software',
    'mobile banking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Accounts and services' },
    { id: 'admin', name: 'Staff Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'CEO', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Branch Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'teller', name: 'Member Service Rep', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/transactions' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a credit union platform',
    'Create a member banking portal',
    'I need a credit union management system',
    'Build a member services platform',
    'Create a loan and account app',
  ],
};
