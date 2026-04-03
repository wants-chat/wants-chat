/**
 * Aerospace Manufacturing App Type Definition
 *
 * Complete definition for aerospace manufacturing and production.
 * Essential for aerospace manufacturers, component producers, and space technology.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AEROSPACE_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'aerospace-manufacturing',
  name: 'Aerospace Manufacturing',
  category: 'aviation',
  description: 'Aerospace manufacturing platform with production tracking, quality assurance, compliance documentation, and supply chain',
  icon: 'rocket',

  keywords: [
    'aerospace manufacturing',
    'aircraft production',
    'aerospace manufacturing software',
    'component manufacturing',
    'space technology',
    'aerospace manufacturing management',
    'production tracking',
    'aerospace manufacturing practice',
    'aerospace manufacturing scheduling',
    'quality assurance',
    'aerospace manufacturing crm',
    'as9100 compliance',
    'aerospace manufacturing business',
    'nadcap certification',
    'aerospace manufacturing pos',
    'defense manufacturing',
    'aerospace manufacturing operations',
    'composite manufacturing',
    'aerospace manufacturing services',
    'precision machining',
  ],

  synonyms: [
    'aerospace manufacturing platform',
    'aerospace manufacturing software',
    'aircraft production software',
    'component manufacturing software',
    'space technology software',
    'production tracking software',
    'aerospace manufacturing practice software',
    'quality assurance software',
    'as9100 compliance software',
    'defense manufacturing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and status' },
    { id: 'admin', name: 'Production Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and quality' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'quality', name: 'Quality Inspector', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quality' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an aerospace manufacturing platform',
    'Create an aircraft production portal',
    'I need an aerospace component management system',
    'Build a space technology manufacturing platform',
    'Create a production and quality tracking app',
  ],
};
