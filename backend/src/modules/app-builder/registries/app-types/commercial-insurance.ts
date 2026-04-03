/**
 * Commercial Insurance App Type Definition
 *
 * Complete definition for commercial and business insurance agencies.
 * Essential for business insurance agents, commercial lines, and risk management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-insurance',
  name: 'Commercial Insurance',
  category: 'insurance',
  description: 'Commercial insurance platform with business analysis, policy management, certificate tracking, and renewal automation',
  icon: 'building',

  keywords: [
    'commercial insurance',
    'business insurance',
    'commercial insurance software',
    'commercial lines',
    'BOP',
    'commercial insurance management',
    'general liability',
    'commercial insurance agency',
    'commercial insurance scheduling',
    'professional liability',
    'commercial insurance crm',
    'property insurance',
    'commercial insurance business',
    'workers comp',
    'commercial insurance pos',
    'E&O',
    'commercial insurance operations',
    'cyber insurance',
    'commercial insurance services',
    'commercial auto',
  ],

  synonyms: [
    'commercial insurance platform',
    'commercial insurance software',
    'business insurance software',
    'commercial lines software',
    'BOP software',
    'general liability software',
    'commercial insurance agency software',
    'professional liability software',
    'E&O software',
    'commercial auto software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'personal lines'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Policies and certificates' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'producer', layout: 'admin', description: 'Accounts and submissions' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Commercial Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/accounts' },
    { id: 'producer', name: 'Commercial Producer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/submissions' },
    { id: 'client', name: 'Business Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'insurance',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a commercial insurance agency platform',
    'Create a business insurance quoting app',
    'I need a commercial lines management system',
    'Build a certificate of insurance platform',
    'Create a BOP insurance app',
  ],
};
