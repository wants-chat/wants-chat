/**
 * Concrete Contractor App Type Definition
 *
 * Complete definition for concrete contractor and flatwork applications.
 * Essential for concrete companies, flatwork contractors, and decorative concrete.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONCRETE_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'concrete-contractor',
  name: 'Concrete Contractor',
  category: 'construction',
  description: 'Concrete contractor platform with job scheduling, mix tracking, pour management, and estimating',
  icon: 'layers',

  keywords: [
    'concrete contractor',
    'concrete company',
    'flatwork contractor',
    'concrete software',
    'concrete scheduling',
    'concrete estimating',
    'pour management',
    'concrete mix',
    'decorative concrete',
    'stamped concrete',
    'concrete foundations',
    'concrete driveways',
    'concrete patios',
    'concrete finishing',
    'concrete pumping',
    'concrete batch',
    'concrete jobs',
    'concrete crew',
    'concrete tracking',
    'concrete business',
  ],

  synonyms: [
    'concrete contractor platform',
    'concrete contractor software',
    'concrete company software',
    'flatwork software',
    'concrete scheduling software',
    'concrete estimating software',
    'pour management software',
    'concrete business software',
    'decorative concrete software',
    'concrete job software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'concrete ideas'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and scheduling' },
    { id: 'admin', name: 'Concrete Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'finisher', name: 'Finisher', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
    'subcontractor-mgmt',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'analytics',
    'site-safety',
    'change-orders',
    'punch-lists',
    'equipment-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a concrete contractor platform',
    'Create a flatwork scheduling app',
    'I need a concrete estimating system',
    'Build a pour management platform',
    'Create a concrete company app',
  ],
};
