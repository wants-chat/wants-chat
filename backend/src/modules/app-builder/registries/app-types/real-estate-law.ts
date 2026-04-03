/**
 * Real Estate Law App Type Definition
 *
 * Complete definition for real estate attorneys and title services.
 * Essential for real estate closings, title searches, and property transactions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-law',
  name: 'Real Estate Law',
  category: 'legal',
  description: 'Real estate law platform with closing management, title searches, document preparation, and escrow tracking',
  icon: 'home',

  keywords: [
    'real estate law',
    'real estate attorney',
    'real estate law software',
    'title services',
    'real estate closing',
    'real estate law management',
    'title search',
    'real estate firm',
    'real estate scheduling',
    'property transaction',
    'real estate crm',
    'escrow',
    'real estate law business',
    'deed preparation',
    'real estate pos',
    'title insurance',
    'real estate operations',
    'mortgage closing',
    'real estate services',
    'settlement',
  ],

  synonyms: [
    'real estate law platform',
    'real estate law software',
    'real estate attorney software',
    'title services software',
    'real estate closing software',
    'title search software',
    'real estate firm software',
    'escrow software',
    'deed preparation software',
    'settlement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'property management'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Closings and documents' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'closer', layout: 'admin', description: 'Transactions and titles' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Real Estate Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/transactions' },
    { id: 'closer', name: 'Closing Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/closings' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'client-portal',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'matter-notes',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'car-rental'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a real estate law firm platform',
    'Create a closing management app',
    'I need a title search tracking system',
    'Build a real estate transaction platform',
    'Create a settlement services app',
  ],
};
