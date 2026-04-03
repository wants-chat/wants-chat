/**
 * Tax Law App Type Definition
 *
 * Complete definition for tax attorneys and tax resolution.
 * Essential for IRS disputes, tax planning, and tax controversy.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'tax-law',
  name: 'Tax Law',
  category: 'legal',
  description: 'Tax law platform with IRS case tracking, document organization, deadline management, and resolution planning',
  icon: 'calculator',

  keywords: [
    'tax law',
    'tax attorney',
    'tax law software',
    'IRS disputes',
    'tax resolution',
    'tax law management',
    'tax controversy',
    'tax law firm',
    'tax law scheduling',
    'audit defense',
    'tax law crm',
    'tax debt',
    'tax law business',
    'offer in compromise',
    'tax law pos',
    'tax court',
    'tax law operations',
    'penalty abatement',
    'tax law services',
    'tax planning',
  ],

  synonyms: [
    'tax law platform',
    'tax law software',
    'tax attorney software',
    'IRS disputes software',
    'tax resolution software',
    'tax controversy software',
    'tax law firm software',
    'audit defense software',
    'tax court software',
    'tax planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'tax preparation'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and IRS status' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and documents' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Tax Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Tax Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a tax law firm platform',
    'Create an IRS dispute case app',
    'I need a tax resolution tracking system',
    'Build a tax controversy platform',
    'Create an audit defense practice app',
  ],
};
