/**
 * Private Investigation App Type Definition
 *
 * Complete definition for private investigation firm applications.
 * Essential for private investigators, detective agencies, and investigation firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIVATE_INVESTIGATION_APP_TYPE: AppTypeDefinition = {
  id: 'private-investigation',
  name: 'Private Investigation',
  category: 'security',
  description: 'Private investigation platform with case management, surveillance tracking, evidence documentation, and billing',
  icon: 'search',

  keywords: [
    'private investigation',
    'private investigator',
    'detective agency',
    'investigation software',
    'pi software',
    'case management',
    'surveillance tracking',
    'investigation firm',
    'private detective',
    'investigation cases',
    'background checks',
    'skip tracing',
    'investigation reports',
    'evidence management',
    'investigation business',
    'pi agency',
    'investigation scheduling',
    'investigator management',
    'investigation billing',
    'covert investigation',
  ],

  synonyms: [
    'private investigation platform',
    'private investigation software',
    'detective agency software',
    'pi software',
    'case management software',
    'investigation firm software',
    'private detective software',
    'surveillance software',
    'investigation management software',
    'investigator software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'research investigation'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and reports' },
    { id: 'admin', name: 'Investigation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'investigator', layout: 'admin', description: 'Cases and evidence' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Case Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'investigator', name: 'Investigator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'support', name: 'Support Staff', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/research' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'team-management',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a private investigation platform',
    'Create a detective agency app',
    'I need a case management system for PIs',
    'Build an investigation firm app',
    'Create a surveillance tracking platform',
  ],
};
