/**
 * Business Coaching App Type Definition
 *
 * Complete definition for business coaching and entrepreneurial mentorship.
 * Essential for business coaches, startup mentors, and entrepreneurial guidance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUSINESS_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'business-coaching',
  name: 'Business Coaching',
  category: 'professional-services',
  description: 'Business coaching platform with goal tracking, session scheduling, action item management, and progress monitoring tools',
  icon: 'compass',

  keywords: [
    'business coaching',
    'business coach',
    'business coaching software',
    'entrepreneurship',
    'startup coaching',
    'business coaching management',
    'goal setting',
    'business coaching practice',
    'business coaching scheduling',
    'business mentorship',
    'business coaching crm',
    'small business',
    'business coaching business',
    'business growth',
    'business coaching pos',
    'entrepreneur coaching',
    'business coaching operations',
    'accountability',
    'business coaching services',
    'business mentor',
  ],

  synonyms: [
    'business coaching platform',
    'business coaching software',
    'business coach software',
    'entrepreneurship software',
    'startup coaching software',
    'goal setting software',
    'business coaching practice software',
    'business mentorship software',
    'business growth software',
    'business mentor software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and goals' },
    { id: 'admin', name: 'Coaching Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Business Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Coaching Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a business coaching platform',
    'Create an entrepreneur mentorship portal',
    'I need a business coach management system',
    'Build a startup coaching practice platform',
    'Create a business coaching client app',
  ],
};
