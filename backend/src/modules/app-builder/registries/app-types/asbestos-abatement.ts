/**
 * Asbestos Abatement App Type Definition
 *
 * Complete definition for asbestos abatement operations.
 * Essential for asbestos contractors, environmental remediation, and hazmat specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASBESTOS_ABATEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'asbestos-abatement',
  name: 'Asbestos Abatement',
  category: 'services',
  description: 'Asbestos abatement platform with survey scheduling, project management, compliance tracking, and disposal documentation',
  icon: 'shield-alert',

  keywords: [
    'asbestos abatement',
    'asbestos removal',
    'asbestos abatement software',
    'environmental remediation',
    'hazmat',
    'asbestos abatement management',
    'survey scheduling',
    'asbestos abatement practice',
    'asbestos abatement scheduling',
    'project management',
    'asbestos abatement crm',
    'compliance tracking',
    'asbestos abatement business',
    'disposal documentation',
    'asbestos abatement pos',
    'lead abatement',
    'asbestos abatement operations',
    'air monitoring',
    'asbestos abatement platform',
    'encapsulation',
  ],

  synonyms: [
    'asbestos abatement platform',
    'asbestos abatement software',
    'asbestos removal software',
    'environmental remediation software',
    'hazmat software',
    'survey scheduling software',
    'asbestos abatement practice software',
    'project management software',
    'compliance tracking software',
    'lead abatement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and reports' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Abatement and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Site Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'worker', name: 'Abatement Worker', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'customer', name: 'Property Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'safety',

  examplePrompts: [
    'Build an asbestos abatement platform',
    'Create an environmental remediation app',
    'I need an abatement project system',
    'Build a hazmat contractor app',
    'Create an asbestos removal portal',
  ],
};
