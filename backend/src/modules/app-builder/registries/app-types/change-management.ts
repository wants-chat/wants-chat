/**
 * Change Management App Type Definition
 *
 * Complete definition for change management and organizational transformation consulting.
 * Essential for change consultants, transformation specialists, and organizational development.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHANGE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'change-management',
  name: 'Change Management',
  category: 'professional-services',
  description: 'Change management platform with stakeholder analysis, communication planning, adoption tracking, and resistance management tools',
  icon: 'refresh-cw',

  keywords: [
    'change management',
    'organizational change',
    'change management software',
    'transformation',
    'change consulting',
    'change management management',
    'adoption tracking',
    'change management practice',
    'change management scheduling',
    'stakeholder management',
    'change management crm',
    'resistance management',
    'change management business',
    'organizational transformation',
    'change management pos',
    'communication planning',
    'change management operations',
    'change readiness',
    'change management services',
    'OCM consulting',
  ],

  synonyms: [
    'change management platform',
    'change management software',
    'organizational change software',
    'transformation software',
    'change consulting software',
    'adoption tracking software',
    'change management practice software',
    'stakeholder management software',
    'organizational transformation software',
    'OCM consulting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Change progress and resources' },
    { id: 'admin', name: 'Change Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and initiatives' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Change Lead', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/initiatives' },
    { id: 'consultant', name: 'Change Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a change management platform',
    'Create an organizational transformation portal',
    'I need a change consulting management system',
    'Build a change management practice platform',
    'Create a stakeholder engagement tracking app',
  ],
};
