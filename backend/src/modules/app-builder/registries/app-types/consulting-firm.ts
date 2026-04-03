/**
 * Consulting Firm App Type Definition
 *
 * Complete definition for consulting firm and professional services applications.
 * Essential for management consultancies, business consultants, and advisory firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONSULTING_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'consulting-firm',
  name: 'Consulting Firm',
  category: 'professional-services',
  description: 'Consulting firm platform with engagement management, deliverable tracking, knowledge base, and utilization reporting',
  icon: 'briefcase',

  keywords: [
    'consulting firm',
    'management consulting',
    'business consulting',
    'consulting services',
    'advisory firm',
    'consulting software',
    'consulting management',
    'engagement management',
    'consulting projects',
    'consulting billing',
    'consultant tracking',
    'knowledge management',
    'consulting proposals',
    'consulting deliverables',
    'professional services',
    'strategy consulting',
    'it consulting',
    'consulting practice',
    'consulting portal',
    'consultant utilization',
  ],

  synonyms: [
    'consulting firm platform',
    'consulting firm software',
    'management consulting software',
    'consulting management software',
    'engagement management software',
    'professional services software',
    'consulting billing software',
    'advisory firm software',
    'consulting practice software',
    'consultant tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'freelance consulting'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Engagements and deliverables' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'consultant', layout: 'admin', description: 'Projects and resources' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'partner', name: 'Partner', level: 90, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/engagements' },
    { id: 'manager', name: 'Engagement Manager', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'consultant', name: 'Consultant', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'analyst', name: 'Analyst', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/research' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'time-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a consulting firm platform',
    'Create a management consulting app',
    'I need a consulting engagement tracker',
    'Build a professional services system',
    'Create a consultant utilization platform',
  ],
};
