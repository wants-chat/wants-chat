/**
 * POS Systems App Type Definition
 *
 * Complete definition for POS system vendors and payment solutions.
 * Essential for POS resellers, payment processors, and retail technology providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POS_SYSTEMS_APP_TYPE: AppTypeDefinition = {
  id: 'pos-systems',
  name: 'POS Systems Provider',
  category: 'technology',
  description: 'POS systems platform with merchant onboarding, equipment leasing, payment processing, and technical support',
  icon: 'credit-card',

  keywords: [
    'pos systems',
    'payment solutions',
    'pos systems software',
    'merchant services',
    'payment processing',
    'pos systems management',
    'merchant onboarding',
    'pos systems practice',
    'pos systems scheduling',
    'equipment leasing',
    'pos systems crm',
    'terminal sales',
    'pos systems business',
    'card processing',
    'pos systems platform',
    'retail technology',
    'pos systems operations',
    'payment gateway',
    'pos systems services',
    'point of sale',
  ],

  synonyms: [
    'pos systems platform',
    'pos systems software',
    'payment solutions software',
    'merchant services software',
    'payment processing software',
    'merchant onboarding software',
    'pos systems practice software',
    'equipment leasing software',
    'terminal sales software',
    'retail technology software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Merchant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and billing' },
    { id: 'admin', name: 'Provider Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Merchants and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Provider Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/merchants' },
    { id: 'support', name: 'Support Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'merchant', name: 'Merchant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a POS systems provider platform',
    'Create a payment solutions portal',
    'I need a merchant services management system',
    'Build a terminal leasing platform',
    'Create a POS equipment and merchant onboarding app',
  ],
};
