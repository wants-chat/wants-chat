/**
 * Senior Technology Help App Type Definition
 *
 * Complete definition for senior technology assistance operations.
 * Essential for tech tutoring for seniors, digital literacy services, and elderly tech support.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_TECHNOLOGY_HELP_APP_TYPE: AppTypeDefinition = {
  id: 'senior-technology-help',
  name: 'Senior Technology Help',
  category: 'education',
  description: 'Senior tech help platform with lesson scheduling, device setup, troubleshooting, and ongoing support',
  icon: 'laptop',

  keywords: [
    'senior technology help',
    'tech tutoring seniors',
    'senior technology help software',
    'digital literacy',
    'elderly tech support',
    'senior technology help management',
    'lesson scheduling',
    'senior technology help practice',
    'senior technology help scheduling',
    'device setup',
    'senior technology help crm',
    'troubleshooting',
    'senior technology help business',
    'ongoing support',
    'senior technology help pos',
    'smartphone training',
    'senior technology help operations',
    'computer basics',
    'senior technology help platform',
    'internet safety',
  ],

  synonyms: [
    'senior technology help platform',
    'senior technology help software',
    'tech tutoring seniors software',
    'digital literacy software',
    'elderly tech support software',
    'lesson scheduling software',
    'senior technology help practice software',
    'device setup software',
    'troubleshooting software',
    'smartphone training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and support' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Service Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Tech Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'support', name: 'Tech Support', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'client', name: 'Senior Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'simple',

  examplePrompts: [
    'Build a senior technology help platform',
    'Create a tech tutoring for seniors app',
    'I need a digital literacy service system',
    'Build an elderly tech support app',
    'Create a senior tech help portal',
  ],
};
