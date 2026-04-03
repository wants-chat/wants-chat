/**
 * Aircraft Sales App Type Definition
 *
 * Complete definition for aircraft sales and brokerage services.
 * Essential for aircraft dealers, brokers, and aviation sales.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRCRAFT_SALES_APP_TYPE: AppTypeDefinition = {
  id: 'aircraft-sales',
  name: 'Aircraft Sales',
  category: 'aviation',
  description: 'Aircraft sales platform with inventory listings, buyer matching, transaction management, and market analysis',
  icon: 'plane-takeoff',

  keywords: [
    'aircraft sales',
    'aircraft broker',
    'aircraft sales software',
    'plane dealer',
    'aviation sales',
    'aircraft sales management',
    'inventory listings',
    'aircraft sales practice',
    'aircraft sales scheduling',
    'buyer matching',
    'aircraft sales crm',
    'aircraft acquisitions',
    'aircraft sales business',
    'pre-buy inspections',
    'aircraft sales pos',
    'aircraft valuations',
    'aircraft sales operations',
    'jet sales',
    'aircraft sales services',
    'helicopter sales',
  ],

  synonyms: [
    'aircraft sales platform',
    'aircraft sales software',
    'aircraft broker software',
    'plane dealer software',
    'aviation sales software',
    'inventory listings software',
    'aircraft sales practice software',
    'buyer matching software',
    'aircraft acquisitions software',
    'jet sales software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Buyer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Aircraft listings' },
    { id: 'admin', name: 'Broker Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and deals' },
  ],

  roles: [
    { id: 'admin', name: 'Brokerage Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'broker', name: 'Senior Broker', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/listings' },
    { id: 'agent', name: 'Sales Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
    { id: 'buyer', name: 'Buyer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'aviation',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an aircraft sales platform',
    'Create an aircraft broker portal',
    'I need a plane dealer management system',
    'Build an aviation sales platform',
    'Create an aircraft listing and buyer matching app',
  ],
};
