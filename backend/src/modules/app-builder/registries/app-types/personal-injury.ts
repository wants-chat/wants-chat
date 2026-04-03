/**
 * Personal Injury App Type Definition
 *
 * Complete definition for personal injury law firms.
 * Essential for PI attorneys, accident claims, and injury litigation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_INJURY_APP_TYPE: AppTypeDefinition = {
  id: 'personal-injury',
  name: 'Personal Injury',
  category: 'legal',
  description: 'Personal injury platform with case intake, medical record tracking, settlement negotiation, and lien management',
  icon: 'shield',

  keywords: [
    'personal injury',
    'PI attorney',
    'personal injury software',
    'accident lawyer',
    'injury cases',
    'personal injury management',
    'car accident',
    'personal injury firm',
    'personal injury scheduling',
    'slip and fall',
    'personal injury crm',
    'medical malpractice',
    'personal injury business',
    'wrongful death',
    'personal injury pos',
    'workers comp',
    'personal injury operations',
    'settlement',
    'personal injury services',
    'contingency fee',
  ],

  synonyms: [
    'personal injury platform',
    'personal injury software',
    'PI attorney software',
    'accident lawyer software',
    'injury cases software',
    'car accident software',
    'personal injury firm software',
    'medical malpractice software',
    'settlement software',
    'contingency fee software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'health insurance'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and updates' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and medical records' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'PI Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Case Manager', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/records' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'billing-timekeeping',
    'client-portal',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'document-assembly',
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a personal injury law firm platform',
    'Create an accident case management app',
    'I need a PI attorney client portal',
    'Build a medical record tracking platform',
    'Create a settlement negotiation app',
  ],
};
