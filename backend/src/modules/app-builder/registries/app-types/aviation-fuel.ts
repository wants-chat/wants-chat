/**
 * Aviation Fuel App Type Definition
 *
 * Complete definition for aviation fuel providers and FBO fuel services.
 * Essential for fuel providers, fuel farms, and aviation fuel distributors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_FUEL_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-fuel',
  name: 'Aviation Fuel Provider',
  category: 'aviation',
  description: 'Aviation fuel platform with fuel ordering, tank management, delivery scheduling, and pricing management',
  icon: 'fuel',

  keywords: [
    'aviation fuel',
    'jet fuel',
    'aviation fuel software',
    'avgas',
    'fuel provider',
    'aviation fuel management',
    'fuel ordering',
    'aviation fuel practice',
    'aviation fuel scheduling',
    'tank management',
    'aviation fuel crm',
    'fuel farm',
    'aviation fuel business',
    'fuel delivery',
    'aviation fuel pos',
    'fuel pricing',
    'aviation fuel operations',
    'into-plane services',
    'aviation fuel services',
    'fuel quality',
  ],

  synonyms: [
    'aviation fuel platform',
    'aviation fuel software',
    'jet fuel software',
    'avgas software',
    'fuel provider software',
    'fuel ordering software',
    'aviation fuel practice software',
    'tank management software',
    'fuel farm software',
    'into-plane services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and pricing' },
    { id: 'admin', name: 'Fuel Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Fuel Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/deliveries' },
    { id: 'driver', name: 'Fuel Truck Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'aviation',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an aviation fuel provider platform',
    'Create a jet fuel ordering portal',
    'I need a fuel farm management system',
    'Build an aviation fuel delivery platform',
    'Create a fuel ordering and tank management app',
  ],
};
