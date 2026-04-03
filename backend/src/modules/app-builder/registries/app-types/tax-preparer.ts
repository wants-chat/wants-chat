/**
 * Tax Preparer App Type Definition
 *
 * Complete definition for tax preparation service operations.
 * Essential for tax preparers, CPAs, and tax service offices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_PREPARER_APP_TYPE: AppTypeDefinition = {
  id: 'tax-preparer',
  name: 'Tax Preparer',
  category: 'professional-services',
  description: 'Tax preparation platform with client intake, document collection, return tracking, and refund management',
  icon: 'calculator',

  keywords: [
    'tax preparer',
    'tax preparation',
    'tax preparer software',
    'cpa',
    'tax service',
    'tax preparer management',
    'client intake',
    'tax preparer practice',
    'tax preparer scheduling',
    'document collection',
    'tax preparer crm',
    'return tracking',
    'tax preparer business',
    'refund management',
    'tax preparer pos',
    'individual taxes',
    'tax preparer operations',
    'business taxes',
    'tax preparer platform',
    'irs compliance',
  ],

  synonyms: [
    'tax preparer platform',
    'tax preparer software',
    'tax preparation software',
    'cpa software',
    'tax service software',
    'client intake software',
    'tax preparer practice software',
    'document collection software',
    'return tracking software',
    'irs compliance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Documents and status' },
    { id: 'admin', name: 'Office Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Returns and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Office Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'preparer', name: 'Tax Preparer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/returns' },
    { id: 'staff', name: 'Office Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
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
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a tax preparer platform',
    'Create a tax preparation portal',
    'I need a tax preparer management system',
    'Build a document collection platform',
    'Create a return tracking and refund app',
  ],
};
