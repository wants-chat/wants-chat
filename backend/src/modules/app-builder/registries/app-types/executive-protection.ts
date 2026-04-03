/**
 * Executive Protection App Type Definition
 *
 * Complete definition for executive protection service operations.
 * Essential for executive protection agencies, VIP security, and close protection services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXECUTIVE_PROTECTION_APP_TYPE: AppTypeDefinition = {
  id: 'executive-protection',
  name: 'Executive Protection',
  category: 'services',
  description: 'Executive protection platform with detail scheduling, threat assessment, travel coordination, and team communication',
  icon: 'shield-check',

  keywords: [
    'executive protection',
    'vip security',
    'executive protection software',
    'close protection',
    'bodyguard service',
    'executive protection management',
    'detail scheduling',
    'executive protection practice',
    'executive protection scheduling',
    'threat assessment',
    'executive protection crm',
    'travel coordination',
    'executive protection business',
    'team communication',
    'executive protection pos',
    'secure transportation',
    'executive protection operations',
    'celebrity protection',
    'executive protection platform',
    'dignitary protection',
  ],

  synonyms: [
    'executive protection platform',
    'executive protection software',
    'vip security software',
    'close protection software',
    'bodyguard service software',
    'detail scheduling software',
    'executive protection practice software',
    'threat assessment software',
    'travel coordination software',
    'secure transportation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and coordination' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Details and teams' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/details' },
    { id: 'agent', name: 'Protection Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'client', name: 'Client/Principal', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'premium',

  examplePrompts: [
    'Build an executive protection platform',
    'Create a VIP security service app',
    'I need a close protection company system',
    'Build a bodyguard service app',
    'Create an executive protection portal',
  ],
};
