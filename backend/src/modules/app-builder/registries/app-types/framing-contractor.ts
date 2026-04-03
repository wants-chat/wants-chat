/**
 * Framing Contractor App Type Definition
 *
 * Complete definition for framing contractor and structural carpentry applications.
 * Essential for framing companies, rough carpentry, and structural contractors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FRAMING_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'framing-contractor',
  name: 'Framing Contractor',
  category: 'construction',
  description: 'Framing contractor platform with job scheduling, crew management, material tracking, and estimating',
  icon: 'frame',

  keywords: [
    'framing contractor',
    'framing company',
    'rough carpentry',
    'structural framing',
    'wood framing',
    'steel framing',
    'framing software',
    'framing estimating',
    'framing scheduling',
    'house framing',
    'commercial framing',
    'residential framing',
    'framing crew',
    'framing subcontractor',
    'timber framing',
    'framing materials',
    'framing takeoff',
    'framing business',
    'structural carpentry',
    'framing jobs',
  ],

  synonyms: [
    'framing contractor platform',
    'framing contractor software',
    'framing company software',
    'rough carpentry software',
    'framing scheduling software',
    'framing estimating software',
    'structural framing software',
    'framing crew software',
    'framing management software',
    'framing business software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'picture framing', 'photo framing'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Framing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'foreman', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'framer', name: 'Framer', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
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
    'subcontractor-mgmt',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'time-tracking',
    'appointments',
    'analytics',
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a framing contractor platform',
    'Create a framing crew management app',
    'I need a framing estimating system',
    'Build a structural framing app',
    'Create a rough carpentry company app',
  ],
};
