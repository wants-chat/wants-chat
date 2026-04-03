/**
 * Environmental Consulting App Type Definition
 *
 * Complete definition for environmental consulting firms.
 * Essential for environmental consultants, impact assessors, and compliance specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENVIRONMENTAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'environmental-consulting',
  name: 'Environmental Consulting',
  category: 'environmental',
  description: 'Environmental consulting platform with project management, site assessments, regulatory tracking, and reporting',
  icon: 'leaf',

  keywords: [
    'environmental consulting',
    'impact assessment',
    'environmental consulting software',
    'environmental compliance',
    'site assessment',
    'environmental consulting management',
    'project management',
    'environmental consulting practice',
    'environmental consulting scheduling',
    'regulatory tracking',
    'environmental consulting crm',
    'remediation',
    'environmental consulting business',
    'phase i esa',
    'environmental consulting pos',
    'wetland delineation',
    'environmental consulting operations',
    'nepa compliance',
    'environmental consulting services',
    'sustainability consulting',
  ],

  synonyms: [
    'environmental consulting platform',
    'environmental consulting software',
    'impact assessment software',
    'environmental compliance software',
    'site assessment software',
    'project management software',
    'environmental consulting practice software',
    'regulatory tracking software',
    'remediation software',
    'sustainability consulting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and reports' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and staff' },
  ],

  roles: [
    { id: 'admin', name: 'Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'scientist', name: 'Environmental Scientist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assessments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an environmental consulting platform',
    'Create an impact assessment portal',
    'I need an environmental compliance management system',
    'Build a site assessment firm platform',
    'Create a project and regulatory tracking app',
  ],
};
