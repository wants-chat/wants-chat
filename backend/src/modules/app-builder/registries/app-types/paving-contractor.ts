/**
 * Paving Contractor App Type Definition
 *
 * Complete definition for asphalt and concrete paving contractor applications.
 * Essential for paving companies, asphalt contractors, and road construction.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAVING_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'paving-contractor',
  name: 'Paving Contractor',
  category: 'construction',
  description: 'Paving contractor platform with job scheduling, material tracking, crew management, and estimating',
  icon: 'road',

  keywords: [
    'paving contractor',
    'asphalt contractor',
    'paving company',
    'asphalt paving',
    'concrete paving',
    'driveway paving',
    'parking lot paving',
    'road paving',
    'paving software',
    'asphalt estimating',
    'sealcoating',
    'striping',
    'paving scheduling',
    'asphalt maintenance',
    'hot mix asphalt',
    'paving crew',
    'asphalt repair',
    'paving business',
    'commercial paving',
    'residential paving',
  ],

  synonyms: [
    'paving contractor platform',
    'paving contractor software',
    'asphalt contractor software',
    'paving company software',
    'asphalt paving software',
    'paving scheduling software',
    'asphalt estimating software',
    'paving management software',
    'driveway paving software',
    'parking lot software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'paving stones decorative'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Paving Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'operator', name: 'Equipment Operator', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'inventory',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'analytics',
    'subcontractor-mgmt',
    'site-safety',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a paving contractor platform',
    'Create an asphalt paving company app',
    'I need a paving estimating system',
    'Build a driveway paving scheduler',
    'Create a parking lot paving app',
  ],
};
