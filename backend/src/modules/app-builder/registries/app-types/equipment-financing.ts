/**
 * Equipment Financing App Type Definition
 *
 * Complete definition for equipment financing company operations.
 * Essential for equipment lenders, leasing companies, and asset-based lenders.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EQUIPMENT_FINANCING_APP_TYPE: AppTypeDefinition = {
  id: 'equipment-financing',
  name: 'Equipment Financing',
  category: 'finance',
  description: 'Equipment financing platform with application processing, credit analysis, lease management, and asset tracking',
  icon: 'truck',

  keywords: [
    'equipment financing',
    'equipment leasing',
    'equipment financing software',
    'asset-based lending',
    'commercial lending',
    'equipment financing management',
    'application processing',
    'equipment financing practice',
    'equipment financing scheduling',
    'credit analysis',
    'equipment financing crm',
    'lease management',
    'equipment financing business',
    'asset tracking',
    'equipment financing pos',
    'vendor programs',
    'equipment financing operations',
    'residual values',
    'equipment financing platform',
    'end of lease',
  ],

  synonyms: [
    'equipment financing platform',
    'equipment financing software',
    'equipment leasing software',
    'asset-based lending software',
    'commercial lending software',
    'application processing software',
    'equipment financing practice software',
    'credit analysis software',
    'lease management software',
    'asset tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Borrower Portal', enabled: true, basePath: '/', layout: 'public', description: 'Applications and leases' },
    { id: 'admin', name: 'Lender Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Applications and portfolio' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'underwriter', name: 'Credit Analyst', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/applications' },
    { id: 'coordinator', name: 'Funding Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
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

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an equipment financing platform',
    'Create a leasing company portal',
    'I need an equipment lending system',
    'Build a lease and asset platform',
    'Create an application processing app',
  ],
};
