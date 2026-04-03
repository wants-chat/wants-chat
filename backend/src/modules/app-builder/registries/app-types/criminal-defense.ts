/**
 * Criminal Defense App Type Definition
 *
 * Complete definition for criminal defense attorneys.
 * Essential for criminal lawyers, defense cases, and court proceedings.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRIMINAL_DEFENSE_APP_TYPE: AppTypeDefinition = {
  id: 'criminal-defense',
  name: 'Criminal Defense',
  category: 'legal',
  description: 'Criminal defense platform with case management, court date tracking, evidence organization, and jail visit scheduling',
  icon: 'gavel',

  keywords: [
    'criminal defense',
    'criminal attorney',
    'criminal defense software',
    'defense lawyer',
    'criminal cases',
    'criminal defense management',
    'DUI attorney',
    'criminal defense firm',
    'criminal defense scheduling',
    'felony defense',
    'criminal defense crm',
    'misdemeanor',
    'criminal defense business',
    'bail bonds',
    'criminal defense pos',
    'plea bargain',
    'criminal defense operations',
    'trial prep',
    'criminal defense services',
    'public defender',
  ],

  synonyms: [
    'criminal defense platform',
    'criminal defense software',
    'criminal attorney software',
    'defense lawyer software',
    'criminal cases software',
    'DUI attorney software',
    'criminal defense firm software',
    'felony defense software',
    'trial prep software',
    'public defender software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'civil litigation'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and court dates' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and evidence' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Defense Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Legal Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/evidence' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'court-calendar',
    'billing-timekeeping',
    'matter-notes',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'document-assembly',
    'conflict-check',
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

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a criminal defense firm platform',
    'Create a defense case management app',
    'I need a criminal attorney client portal',
    'Build a court date tracking platform',
    'Create a DUI defense practice app',
  ],
};
