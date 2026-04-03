/**
 * IT Consulting App Type Definition
 *
 * Complete definition for IT consulting and technology advisory firms.
 * Essential for technology strategy, digital transformation, and IT solutions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'it-consulting',
  name: 'IT Consulting',
  category: 'professional-services',
  description: 'IT consulting platform with technology assessment, project delivery, system integration tracking, and digital transformation management',
  icon: 'cpu',

  keywords: [
    'IT consulting',
    'technology consulting',
    'IT consulting software',
    'digital transformation',
    'technology advisory',
    'IT consulting management',
    'system integration',
    'IT consulting practice',
    'IT consulting scheduling',
    'cloud consulting',
    'IT consulting crm',
    'software implementation',
    'IT consulting business',
    'infrastructure consulting',
    'IT consulting pos',
    'cybersecurity consulting',
    'IT consulting operations',
    'enterprise architecture',
    'IT consulting services',
    'tech consulting',
  ],

  synonyms: [
    'IT consulting platform',
    'IT consulting software',
    'technology consulting software',
    'digital transformation software',
    'technology advisory software',
    'system integration software',
    'IT consulting practice software',
    'cloud consulting software',
    'infrastructure consulting software',
    'tech consulting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and documentation' },
    { id: 'admin', name: 'IT Consulting Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and projects' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Technical Lead', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'consultant', name: 'IT Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
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
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build an IT consulting platform',
    'Create a technology advisory client portal',
    'I need a digital transformation consulting system',
    'Build a tech consulting practice platform',
    'Create an IT project management app',
  ],
};
