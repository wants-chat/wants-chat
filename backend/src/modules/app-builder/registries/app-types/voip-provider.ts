/**
 * VoIP Provider App Type Definition
 *
 * Complete definition for VoIP service providers and telecommunications.
 * Essential for VoIP providers, phone system vendors, and communication platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOIP_PROVIDER_APP_TYPE: AppTypeDefinition = {
  id: 'voip-provider',
  name: 'VoIP Provider',
  category: 'technology',
  description: 'VoIP provider platform with number provisioning, call analytics, billing management, and customer portal',
  icon: 'phone',

  keywords: [
    'voip provider',
    'telecommunications',
    'voip software',
    'phone systems',
    'cloud pbx',
    'voip management',
    'number provisioning',
    'voip practice',
    'voip scheduling',
    'call analytics',
    'voip crm',
    'sip trunking',
    'voip business',
    'unified communications',
    'voip pos',
    'business phone',
    'voip operations',
    'video conferencing',
    'voip services',
    'call center',
  ],

  synonyms: [
    'voip provider platform',
    'voip software',
    'telecommunications software',
    'phone systems software',
    'cloud pbx software',
    'number provisioning software',
    'voip practice software',
    'call analytics software',
    'sip trunking software',
    'unified communications software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lines and billing' },
    { id: 'admin', name: 'Provider Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Numbers and customers' },
  ],

  roles: [
    { id: 'admin', name: 'Provider Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Telecom Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/numbers' },
    { id: 'support', name: 'Support Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a VoIP provider platform',
    'Create a telecommunications portal',
    'I need a cloud phone system platform',
    'Build a business phone service platform',
    'Create a VoIP billing and provisioning app',
  ],
};
