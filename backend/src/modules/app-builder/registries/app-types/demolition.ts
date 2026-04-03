/**
 * Demolition App Type Definition
 *
 * Complete definition for demolition contractor applications.
 * Essential for demolition companies, deconstruction, and site clearing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DEMOLITION_APP_TYPE: AppTypeDefinition = {
  id: 'demolition',
  name: 'Demolition',
  category: 'construction',
  description: 'Demolition contractor platform with project planning, safety management, disposal tracking, and compliance',
  icon: 'hammer',

  keywords: [
    'demolition contractor',
    'demolition company',
    'deconstruction',
    'site clearing',
    'demolition software',
    'demolition projects',
    'building demolition',
    'commercial demolition',
    'residential demolition',
    'selective demolition',
    'interior demolition',
    'demolition safety',
    'debris removal',
    'demolition permits',
    'asbestos abatement',
    'demolition disposal',
    'demolition planning',
    'wrecking',
    'demolition estimating',
    'demolition management',
  ],

  synonyms: [
    'demolition contractor platform',
    'demolition contractor software',
    'demolition company software',
    'deconstruction software',
    'demolition management software',
    'demolition project software',
    'demolition safety software',
    'site clearing software',
    'demolition estimating software',
    'demolition tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'derby demolition'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Demo Dashboard', enabled: true, basePath: '/admin', requiredRole: 'super', layout: 'admin', description: 'Projects and safety' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'safety', name: 'Safety Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/safety' },
    { id: 'super', name: 'Superintendent', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'operator', name: 'Equipment Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'site-safety',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'team-management',
    'analytics',
    'subcontractor-mgmt',
    'material-takeoffs',
    'change-orders',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a demolition contractor platform',
    'Create a demolition project management app',
    'I need a demolition safety tracking system',
    'Build a deconstruction company app',
    'Create a demolition disposal tracker',
  ],
};
