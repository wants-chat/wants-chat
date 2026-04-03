/**
 * Greenhouse App Type Definition
 *
 * Complete definition for greenhouse management and controlled environment agriculture applications.
 * Essential for commercial greenhouses, vertical farms, and indoor growing operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GREENHOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'greenhouse',
  name: 'Greenhouse',
  category: 'agriculture',
  description: 'Greenhouse management platform with climate control, crop tracking, inventory, and automation',
  icon: 'leaf',

  keywords: [
    'greenhouse',
    'greenhouse management',
    'controlled environment',
    'indoor farming',
    'vertical farm',
    'greenhouse software',
    'climate control',
    'greenhouse automation',
    'grow room',
    'hydroponic',
    'greenhouse crops',
    'nursery management',
    'plant propagation',
    'greenhouse climate',
    'greenhouse sensors',
    'growing conditions',
    'greenhouse inventory',
    'CEA',
    'indoor agriculture',
    'greenhouse operations',
  ],

  synonyms: [
    'greenhouse management platform',
    'greenhouse management software',
    'greenhouse automation software',
    'controlled environment software',
    'vertical farm software',
    'indoor farming software',
    'greenhouse climate control',
    'nursery management software',
    'hydroponic management software',
    'CEA software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'greenhouse gas'],

  sections: [
    { id: 'frontend', name: 'Grow Portal', enabled: true, basePath: '/', layout: 'public', description: 'Production overview' },
    { id: 'admin', name: 'Greenhouse Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Climate and crops' },
  ],

  roles: [
    { id: 'admin', name: 'Greenhouse Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Grow Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/zones' },
    { id: 'grower', name: 'Head Grower', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/crops' },
    { id: 'technician', name: 'Climate Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/climate' },
    { id: 'worker', name: 'Greenhouse Worker', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'tasks',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a greenhouse management platform',
    'Create a vertical farm management app',
    'I need a greenhouse climate control system',
    'Build an indoor farming application',
    'Create a controlled environment ag platform',
  ],
};
