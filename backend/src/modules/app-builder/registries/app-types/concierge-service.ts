/**
 * Concierge Service App Type Definition
 *
 * Complete definition for concierge services.
 * Essential for luxury concierge, lifestyle management, and VIP services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONCIERGE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'concierge-service',
  name: 'Concierge Service',
  category: 'personal-services',
  description: 'Concierge platform with request management, vendor coordination, reservation booking, and membership tiers',
  icon: 'star',

  keywords: [
    'concierge service',
    'luxury concierge',
    'concierge service software',
    'lifestyle management',
    'vip services',
    'concierge service management',
    'request management',
    'concierge service practice',
    'concierge service booking',
    'vendor coordination',
    'concierge service crm',
    'travel concierge',
    'concierge service business',
    'reservation booking',
    'concierge service pos',
    'event access',
    'concierge service operations',
    'personal services',
    'concierge service platform',
    'exclusive access',
  ],

  synonyms: [
    'concierge service platform',
    'concierge service software',
    'luxury concierge software',
    'lifestyle management software',
    'vip services software',
    'request management software',
    'concierge service practice software',
    'vendor coordination software',
    'travel concierge software',
    'exclusive access software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Requests and services' },
    { id: 'admin', name: 'Concierge Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and requests' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Head Concierge', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'concierge', name: 'Concierge', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'luxury-services',

  defaultColorScheme: 'gold',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build a concierge service platform',
    'Create a luxury lifestyle management portal',
    'I need a VIP request management system',
    'Build a membership concierge platform',
    'Create a vendor coordination and booking app',
  ],
};
