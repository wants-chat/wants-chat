/**
 * Translation Service App Type Definition
 *
 * Complete definition for translation service and localization applications.
 * Essential for translation agencies, localization companies, and interpreting services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSLATION_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'translation-service',
  name: 'Translation Service',
  category: 'professional-services',
  description: 'Translation service platform with project management, translator assignment, CAT tool integration, and quality review',
  icon: 'languages',

  keywords: [
    'translation service',
    'translation agency',
    'localization',
    'interpreting service',
    'translation software',
    'translation management',
    'cat tools',
    'translator portal',
    'language services',
    'translation projects',
    'localization management',
    'translation memory',
    'terminology management',
    'translation workflow',
    'multilingual',
    'document translation',
    'certified translation',
    'translation vendor',
    'translation quality',
    'language provider',
  ],

  synonyms: [
    'translation service platform',
    'translation service software',
    'translation agency software',
    'localization software',
    'translation management software',
    'language services software',
    'translator management software',
    'localization management software',
    'translation project software',
    'interpreting service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'google translate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and tracking' },
    { id: 'admin', name: 'Translation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'pm', layout: 'admin', description: 'Projects and linguists' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'pm', name: 'Project Manager', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'translator', name: 'Translator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'reviewer', name: 'Reviewer', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/review' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'documents',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'dashboard',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a translation service platform',
    'Create a localization agency app',
    'I need a translator management system',
    'Build a language services portal',
    'Create a translation project tracker',
  ],
};
