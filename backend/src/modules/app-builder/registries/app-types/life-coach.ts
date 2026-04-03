/**
 * Life Coach App Type Definition
 *
 * Complete definition for life coaching services.
 * Essential for life coaches, executive coaches, and personal development.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIFE_COACH_APP_TYPE: AppTypeDefinition = {
  id: 'life-coach',
  name: 'Life Coach',
  category: 'personal-services',
  description: 'Life coaching platform with client management, session scheduling, goal tracking, and resource library',
  icon: 'compass',

  keywords: [
    'life coach',
    'executive coaching',
    'life coach software',
    'personal development',
    'career coaching',
    'life coach management',
    'session scheduling',
    'life coach practice',
    'life coach booking',
    'goal tracking',
    'life coach crm',
    'mindset coaching',
    'life coach business',
    'wellness coaching',
    'life coach pos',
    'transformation',
    'life coach operations',
    'accountability',
    'life coach platform',
    'coaching programs',
  ],

  synonyms: [
    'life coach platform',
    'life coach software',
    'executive coaching software',
    'personal development software',
    'career coaching software',
    'session scheduling software',
    'life coach practice software',
    'goal tracking software',
    'mindset coaching software',
    'coaching programs software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and resources' },
    { id: 'admin', name: 'Coach Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Lead Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'staff', name: 'Associate Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'scheduling',
    'documents',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'dashboard',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'coaching',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a life coaching platform',
    'Create an executive coaching portal',
    'I need a coaching practice management system',
    'Build a client goal tracking platform',
    'Create a coaching session booking app',
  ],
};
