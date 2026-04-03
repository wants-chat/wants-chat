/**
 * Marketing Agency App Type Definition
 *
 * Complete definition for marketing agency and creative agency applications.
 * Essential for digital agencies, advertising agencies, and marketing firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARKETING_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'marketing-agency',
  name: 'Marketing Agency',
  category: 'professional-services',
  description: 'Marketing agency platform with campaign management, client dashboards, content approval, and reporting',
  icon: 'megaphone',

  keywords: [
    'marketing agency',
    'digital agency',
    'advertising agency',
    'creative agency',
    'marketing firm',
    'agency software',
    'campaign management',
    'agency management',
    'client dashboard',
    'marketing projects',
    'agency billing',
    'content approval',
    'agency workflow',
    'marketing services',
    'brand agency',
    'social media agency',
    'seo agency',
    'ppc agency',
    'agency portal',
    'marketing operations',
  ],

  synonyms: [
    'marketing agency platform',
    'marketing agency software',
    'digital agency software',
    'advertising agency software',
    'agency management software',
    'creative agency software',
    'campaign management software',
    'agency billing software',
    'agency client portal',
    'marketing operations software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'freelance marketing'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Campaigns and reports' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'strategist', layout: 'admin', description: 'Projects and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Account Director', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'manager', name: 'Project Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'strategist', name: 'Strategist', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/campaigns' },
    { id: 'creative', name: 'Creative', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'time-tracking',
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

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a marketing agency platform',
    'Create a digital agency management app',
    'I need an agency client portal',
    'Build an advertising agency system',
    'Create a campaign management platform',
  ],
};
