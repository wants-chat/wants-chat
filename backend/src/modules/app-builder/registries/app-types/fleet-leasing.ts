/**
 * Fleet Leasing App Type Definition
 *
 * Complete definition for fleet leasing company operations.
 * Essential for fleet lessors, commercial vehicle leasing, and corporate fleet providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLEET_LEASING_APP_TYPE: AppTypeDefinition = {
  id: 'fleet-leasing',
  name: 'Fleet Leasing',
  category: 'automotive',
  description: 'Fleet leasing platform with vehicle procurement, lease administration, maintenance coordination, and end-of-lease management',
  icon: 'truck',

  keywords: [
    'fleet leasing',
    'commercial leasing',
    'fleet leasing software',
    'corporate fleet',
    'vehicle leasing',
    'fleet leasing management',
    'vehicle procurement',
    'fleet leasing practice',
    'fleet leasing scheduling',
    'lease administration',
    'fleet leasing crm',
    'maintenance coordination',
    'fleet leasing business',
    'end-of-lease',
    'fleet leasing pos',
    'fmv lease',
    'fleet leasing operations',
    'trac lease',
    'fleet leasing platform',
    'remarketing',
  ],

  synonyms: [
    'fleet leasing platform',
    'fleet leasing software',
    'commercial leasing software',
    'corporate fleet software',
    'vehicle leasing software',
    'vehicle procurement software',
    'fleet leasing practice software',
    'lease administration software',
    'maintenance coordination software',
    'remarketing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fleet and services' },
    { id: 'admin', name: 'Lessor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Leases and fleet' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'account-exec', name: 'Account Executive', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'coordinator', name: 'Fleet Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'route-optimization',
    'carrier-integration',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fleet leasing platform',
    'Create a commercial leasing portal',
    'I need a fleet management system',
    'Build a vehicle procurement platform',
    'Create a lease administration app',
  ],
};
