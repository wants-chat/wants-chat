/**
 * Auto Body App Type Definition
 *
 * Complete definition for auto body shop operations.
 * Essential for collision repair, auto body shops, and paint services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_BODY_APP_TYPE: AppTypeDefinition = {
  id: 'auto-body',
  name: 'Auto Body',
  category: 'automotive',
  description: 'Auto body platform with estimate management, repair tracking, insurance claims, and paint matching',
  icon: 'car',

  keywords: [
    'auto body',
    'collision repair',
    'auto body software',
    'body shop',
    'paint services',
    'auto body management',
    'estimate management',
    'auto body practice',
    'auto body scheduling',
    'repair tracking',
    'auto body crm',
    'insurance claims',
    'auto body business',
    'paint matching',
    'auto body pos',
    'dent repair',
    'auto body operations',
    'frame straightening',
    'auto body platform',
    'refinishing',
  ],

  synonyms: [
    'auto body platform',
    'auto body software',
    'collision repair software',
    'body shop software',
    'paint services software',
    'estimate management software',
    'auto body practice software',
    'repair tracking software',
    'insurance claims software',
    'refinishing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Estimates and tracking' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Repairs and insurance' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/estimates' },
    { id: 'technician', name: 'Body Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-history',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'recalls-tracking',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an auto body shop platform',
    'Create a collision repair portal',
    'I need a body shop management system',
    'Build an insurance claims platform',
    'Create an estimate and repair tracking app',
  ],
};
