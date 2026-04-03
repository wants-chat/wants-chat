/**
 * Research Firm App Type Definition
 *
 * Complete definition for market research and research consulting applications.
 * Essential for market research firms, research consultancies, and data analytics firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESEARCH_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'research-firm',
  name: 'Research Firm',
  category: 'professional-services',
  description: 'Research firm platform with study management, participant recruitment, data collection, and report delivery',
  icon: 'chart-bar',

  keywords: [
    'research firm',
    'market research',
    'research consultancy',
    'research agency',
    'research software',
    'study management',
    'research projects',
    'participant recruitment',
    'survey research',
    'qualitative research',
    'quantitative research',
    'focus groups',
    'research panel',
    'data collection',
    'research insights',
    'research reports',
    'ux research',
    'consumer research',
    'research analytics',
    'research platform',
  ],

  synonyms: [
    'research firm platform',
    'research firm software',
    'market research software',
    'research consultancy software',
    'study management software',
    'research project software',
    'participant recruitment software',
    'research panel software',
    'qualitative research software',
    'research insights software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'academic research'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Studies and insights' },
    { id: 'admin', name: 'Research Dashboard', enabled: true, basePath: '/admin', requiredRole: 'researcher', layout: 'admin', description: 'Studies and data' },
  ],

  roles: [
    { id: 'admin', name: 'Research Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/studies' },
    { id: 'researcher', name: 'Senior Researcher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'analyst', name: 'Research Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/data' },
    { id: 'moderator', name: 'Moderator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a market research platform',
    'Create a research firm management app',
    'I need a study management system',
    'Build a participant recruitment platform',
    'Create a research insights portal',
  ],
};
