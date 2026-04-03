/**
 * Permit & Licensing App Type Definition
 *
 * Complete definition for permit and licensing management applications.
 * Essential for building permits, business licenses, and regulatory compliance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERMIT_LICENSING_APP_TYPE: AppTypeDefinition = {
  id: 'permit-licensing',
  name: 'Permit & Licensing',
  category: 'government',
  description: 'Permit platform with online applications, review workflow, inspections, and license management',
  icon: 'file-check',

  keywords: [
    'permit system',
    'licensing system',
    'building permits',
    'business license',
    'permit application',
    'permit software',
    'licensing software',
    'permit tracking',
    'permit management',
    'permit portal',
    'permit review',
    'permit inspection',
    'contractor licensing',
    'permit workflow',
    'permit approval',
    'license renewal',
    'permit fees',
    'code compliance',
    'permit processing',
    'online permits',
  ],

  synonyms: [
    'permit licensing platform',
    'permit management software',
    'licensing management software',
    'permit tracking software',
    'building permit software',
    'business licensing software',
    'permit application software',
    'permit workflow software',
    'permit portal software',
    'licensing portal software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'driving permit'],

  sections: [
    { id: 'frontend', name: 'Applicant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Apply and track permits' },
    { id: 'admin', name: 'Permit Dashboard', enabled: true, basePath: '/admin', requiredRole: 'reviewer', layout: 'admin', description: 'Review and processing' },
  ],

  roles: [
    { id: 'admin', name: 'Department Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Permit Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/applications' },
    { id: 'reviewer', name: 'Plan Reviewer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/review' },
    { id: 'inspector', name: 'Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'clerk', name: 'Permit Clerk', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
    { id: 'applicant', name: 'Applicant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a permit management system',
    'Create a business licensing portal',
    'I need a building permit app',
    'Build a permit tracking platform',
    'Create a license management system',
  ],
};
