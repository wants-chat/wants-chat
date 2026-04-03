/**
 * Career Coaching App Type Definition
 *
 * Complete definition for career coaching and professional development.
 * Essential for career coaches, job transition specialists, and career counselors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAREER_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'career-coaching',
  name: 'Career Coaching',
  category: 'professional-services',
  description: 'Career coaching platform with resume building, interview prep, job search tracking, and career path planning tools',
  icon: 'trending-up',

  keywords: [
    'career coaching',
    'career coach',
    'career coaching software',
    'job search',
    'resume building',
    'career coaching management',
    'interview prep',
    'career coaching practice',
    'career coaching scheduling',
    'career transition',
    'career coaching crm',
    'job placement',
    'career coaching business',
    'career development',
    'career coaching pos',
    'professional development',
    'career coaching operations',
    'job hunting',
    'career coaching services',
    'career counseling',
  ],

  synonyms: [
    'career coaching platform',
    'career coaching software',
    'career coach software',
    'job search software',
    'resume building software',
    'interview prep software',
    'career coaching practice software',
    'career transition software',
    'career development software',
    'career counseling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Career resources and tracking' },
    { id: 'admin', name: 'Coaching Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Career Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Career Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a career coaching platform',
    'Create a job search coaching portal',
    'I need a career transition coaching system',
    'Build a career coaching practice platform',
    'Create a resume building and interview prep app',
  ],
};
