/**
 * Accounting & Bookkeeping App Type Definition
 *
 * Complete definition for accounting and bookkeeping applications.
 * Essential for accountants, bookkeepers, and small businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACCOUNTING_APP_TYPE: AppTypeDefinition = {
  id: 'accounting',
  name: 'Accounting & Bookkeeping',
  category: 'finance',
  description: 'Accounting software with ledger, journal entries, financial reports, and client management',
  icon: 'calculator',

  keywords: [
    'accounting',
    'bookkeeping',
    'accountant',
    'ledger',
    'general ledger',
    'journal entries',
    'chart of accounts',
    'accounts payable',
    'accounts receivable',
    'quickbooks',
    'xero',
    'sage',
    'freshbooks',
    'wave accounting',
    'financial statements',
    'balance sheet',
    'income statement',
    'profit and loss',
    'trial balance',
    'bank reconciliation',
    'double entry',
    'cpa',
    'tax preparation',
    'payroll',
    'financial reporting',
  ],

  synonyms: [
    'accounting software',
    'bookkeeping software',
    'accounting platform',
    'financial software',
    'ledger software',
    'accounting system',
    'bookkeeping system',
    'accounting app',
    'cpa software',
    'financial management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Client access to financial reports' },
    { id: 'admin', name: 'Accounting Dashboard', enabled: true, basePath: '/admin', requiredRole: 'accountant', layout: 'admin', description: 'Full accounting management' },
  ],

  roles: [
    { id: 'admin', name: 'Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'accountant', name: 'Accountant', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/ledger' },
    { id: 'bookkeeper', name: 'Bookkeeper', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/transactions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/reports' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'invoicing',
    'dashboard',
    'time-tracking',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an accounting software',
    'Create a bookkeeping app like QuickBooks',
    'I need an accounting platform for my firm',
    'Build a financial management system',
    'Create an accounting app with ledger and reports',
  ],
};
