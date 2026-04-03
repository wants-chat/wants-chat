/**
 * Survey & Forms App Type Definition
 *
 * Complete definition for survey and form builder applications.
 * Essential for data collection, feedback, and research.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURVEY_APP_TYPE: AppTypeDefinition = {
  id: 'survey',
  name: 'Survey & Forms',
  category: 'business',
  description: 'Form builder and survey platform with responses, analytics, and data collection',
  icon: 'clipboard-question',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'survey',
    'surveys',
    'form',
    'forms',
    'form builder',
    'survey builder',
    'questionnaire',
    'quiz',
    'quiz builder',
    'feedback form',
    'feedback',
    'typeform',
    'google forms',
    'surveymonkey',
    'jotform',
    'wufoo',
    'tally',
    'data collection',
    'responses',
    'form responses',
    'poll',
    'polling',
    'research survey',
    'customer feedback',
    'nps',
    'net promoter',
    'registration form',
    'contact form',
  ],

  synonyms: [
    'form platform',
    'survey platform',
    'quiz platform',
    'form creator',
    'survey creator',
    'questionnaire builder',
    'feedback platform',
    'response collector',
    'form manager',
    'survey manager',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'social media',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Form Response',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public form/survey submission pages',
    },
    {
      id: 'admin',
      name: 'Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'user',
      layout: 'admin',
      description: 'Form builder and response management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/forms',
    },
    {
      id: 'creator',
      name: 'Form Creator',
      level: 50,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/forms',
    },
    {
      id: 'user',
      name: 'User',
      level: 30,
      isDefault: true,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/forms',
    },
    {
      id: 'respondent',
      name: 'Respondent',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'analytics',
    'settings',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'business',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a survey platform',
    'Create a form builder like Typeform',
    'I need a feedback collection app',
    'Build a quiz builder application',
    'Create a customer survey tool',
    'I want to build a form builder',
    'Make a survey app with analytics',
  ],
};
