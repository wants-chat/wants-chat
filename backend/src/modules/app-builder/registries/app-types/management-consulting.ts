/**
 * Management Consulting App Type Definition
 *
 * Complete definition for management consulting firms.
 * Essential for business strategy, operational excellence, and organizational improvement.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MANAGEMENT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'management-consulting',
  name: 'Management Consulting',
  category: 'professional-services',
  description: 'Management consulting platform with project management, client engagement tracking, deliverable management, and strategic planning tools',
  icon: 'briefcase',

  keywords: [
    'management consulting',
    'consulting firm',
    'management consulting software',
    'business strategy',
    'strategic consulting',
    'management consulting management',
    'organizational change',
    'management consulting practice',
    'management consulting scheduling',
    'operations consulting',
    'management consulting crm',
    'performance improvement',
    'management consulting business',
    'executive advisory',
    'management consulting pos',
    'transformation',
    'management consulting operations',
    'process optimization',
    'management consulting services',
    'business consulting',
  ],

  synonyms: [
    'management consulting platform',
    'management consulting software',
    'consulting firm software',
    'business strategy software',
    'strategic consulting software',
    'organizational change software',
    'management consulting practice software',
    'operations consulting software',
    'executive advisory software',
    'transformation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and deliverables' },
    { id: 'admin', name: 'Consulting Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and engagements' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'partner', name: 'Partner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/engagements' },
    { id: 'consultant', name: 'Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
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
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a management consulting platform',
    'Create a strategic consulting client portal',
    'I need a consulting engagement management system',
    'Build a business consulting practice platform',
    'Create a consulting project tracking app',
  ],
};
