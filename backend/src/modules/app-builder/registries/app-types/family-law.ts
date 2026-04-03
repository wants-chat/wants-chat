/**
 * Family Law App Type Definition
 *
 * Complete definition for family law and divorce attorneys.
 * Essential for family law firms, custody cases, and divorce proceedings.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FAMILY_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'family-law',
  name: 'Family Law',
  category: 'legal',
  description: 'Family law platform with case management, custody scheduling, asset tracking, and secure client communication',
  icon: 'users',

  keywords: [
    'family law',
    'divorce attorney',
    'family law software',
    'custody lawyer',
    'family cases',
    'family law management',
    'child support',
    'family law firm',
    'family law scheduling',
    'alimony',
    'family law crm',
    'custody agreement',
    'family law business',
    'prenuptial',
    'family law pos',
    'adoption',
    'family law operations',
    'mediation',
    'family law services',
    'matrimonial',
  ],

  synonyms: [
    'family law platform',
    'family law software',
    'divorce attorney software',
    'custody lawyer software',
    'family cases software',
    'child support software',
    'family law firm software',
    'custody agreement software',
    'adoption law software',
    'matrimonial law software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'criminal law'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and schedules' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and court dates' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Family Law Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'court-calendar',
    'billing-timekeeping',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'document-assembly',
    'conflict-check',
    'matter-notes',
    'client-portal',
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a family law firm platform',
    'Create a divorce case management app',
    'I need a custody tracking system',
    'Build a family law client portal',
    'Create a matrimonial law practice app',
  ],
};
