/**
 * Flooring Store App Type Definition
 *
 * Complete definition for flooring retail and installation operations.
 * Essential for flooring stores, carpet retailers, and floor covering specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOORING_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'flooring-store',
  name: 'Flooring Store',
  category: 'retail',
  description: 'Flooring store platform with room measurement, installation scheduling, sample checkout, and project management',
  icon: 'layout-grid',

  keywords: [
    'flooring store',
    'carpet retailer',
    'flooring store software',
    'floor covering',
    'hardwood flooring',
    'flooring store management',
    'room measurement',
    'flooring store practice',
    'flooring store scheduling',
    'installation scheduling',
    'flooring store crm',
    'sample checkout',
    'flooring store business',
    'project management',
    'flooring store pos',
    'tile flooring',
    'flooring store operations',
    'vinyl flooring',
    'flooring store platform',
    'laminate',
  ],

  synonyms: [
    'flooring store platform',
    'flooring store software',
    'carpet retailer software',
    'floor covering software',
    'hardwood flooring software',
    'room measurement software',
    'flooring store practice software',
    'installation scheduling software',
    'sample checkout software',
    'tile flooring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and estimates' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'estimator', name: 'Estimator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'sales', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'projects',
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
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a flooring store platform',
    'Create a carpet retailer portal',
    'I need a flooring retail system',
    'Build an installation scheduling platform',
    'Create a flooring project app',
  ],
};
