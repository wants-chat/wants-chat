/**
 * Bookkeeping App Type Definition
 *
 * Complete definition for bookkeeping service operations.
 * Essential for bookkeepers, accounting services, and financial record keepers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOOKKEEPING_APP_TYPE: AppTypeDefinition = {
  id: 'bookkeeping',
  name: 'Bookkeeping',
  category: 'professional-services',
  description: 'Bookkeeping platform with client management, transaction tracking, report generation, and bank reconciliation',
  icon: 'book-open',

  keywords: [
    'bookkeeping',
    'bookkeeper',
    'bookkeeping software',
    'accounting services',
    'financial records',
    'bookkeeping management',
    'client management',
    'bookkeeping practice',
    'bookkeeping scheduling',
    'transaction tracking',
    'bookkeeping crm',
    'report generation',
    'bookkeeping business',
    'bank reconciliation',
    'bookkeeping pos',
    'accounts payable',
    'bookkeeping operations',
    'accounts receivable',
    'bookkeeping platform',
    'payroll processing',
  ],

  synonyms: [
    'bookkeeping platform',
    'bookkeeping software',
    'bookkeeper software',
    'accounting services software',
    'financial records software',
    'client management software',
    'bookkeeping practice software',
    'transaction tracking software',
    'report generation software',
    'payroll processing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and documents' },
    { id: 'admin', name: 'Bookkeeper Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'bookkeeper', name: 'Senior Bookkeeper', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'staff', name: 'Staff Bookkeeper', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/transactions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
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
  industry: 'professional-services',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a bookkeeping platform',
    'Create a bookkeeper portal',
    'I need a bookkeeping management system',
    'Build a transaction tracking platform',
    'Create a report and reconciliation app',
  ],
};
