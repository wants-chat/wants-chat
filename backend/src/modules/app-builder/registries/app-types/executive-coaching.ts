/**
 * Executive Coaching App Type Definition
 *
 * Complete definition for executive coaching and leadership development.
 * Essential for executive coaches, C-suite development, and leadership transformation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXECUTIVE_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'executive-coaching',
  name: 'Executive Coaching',
  category: 'professional-services',
  description: 'Executive coaching platform with leadership assessment, 360 feedback, development planning, and executive session management',
  icon: 'award',

  keywords: [
    'executive coaching',
    'leadership coaching',
    'executive coaching software',
    'C-suite coaching',
    'leadership development',
    'executive coaching management',
    'executive development',
    'executive coaching practice',
    'executive coaching scheduling',
    'senior leadership',
    'executive coaching crm',
    'CEO coaching',
    'executive coaching business',
    'leadership transformation',
    'executive coaching pos',
    'board coaching',
    'executive coaching operations',
    '360 feedback',
    'executive coaching services',
    'leadership coach',
  ],

  synonyms: [
    'executive coaching platform',
    'executive coaching software',
    'leadership coaching software',
    'C-suite coaching software',
    'leadership development software',
    'executive development software',
    'executive coaching practice software',
    'senior leadership software',
    'CEO coaching software',
    'leadership coach software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Executive Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and development' },
    { id: 'admin', name: 'Coaching Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and engagements' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Executive Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'executive', name: 'Executive Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'executive',

  examplePrompts: [
    'Build an executive coaching platform',
    'Create a leadership development portal',
    'I need an executive coach management system',
    'Build a C-suite coaching practice platform',
    'Create a leadership coaching app',
  ],
};
