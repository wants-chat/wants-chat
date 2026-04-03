/**
 * Auto Body Shop App Type Definition
 *
 * Complete definition for auto body and collision repair applications.
 * Essential for body shops, collision centers, and paint shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_BODY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'auto-body-shop',
  name: 'Auto Body Shop',
  category: 'automotive',
  description: 'Auto body shop platform with estimates, insurance claims, job tracking, and customer communication',
  icon: 'paintbrush',

  keywords: [
    'auto body shop',
    'collision repair',
    'body shop software',
    'auto body',
    'collision center',
    'paint shop',
    'body shop estimates',
    'insurance claims',
    'auto body repair',
    'collision damage',
    'body shop management',
    'auto body business',
    'dent repair',
    'body work',
    'collision shop',
    'body shop scheduling',
    'auto painting',
    'body shop crm',
    'auto restoration',
    'body shop jobs',
  ],

  synonyms: [
    'auto body shop platform',
    'auto body shop software',
    'collision repair software',
    'body shop management software',
    'collision center software',
    'auto body software',
    'body shop estimate software',
    'collision claim software',
    'auto body repair software',
    'body shop scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'human body'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Estimates and status' },
    { id: 'admin', name: 'Body Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and claims' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'estimator', name: 'Estimator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
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
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an auto body shop platform',
    'Create a collision repair management app',
    'I need a body shop estimating system',
    'Build a collision center app',
    'Create a body shop insurance claims platform',
  ],
};
