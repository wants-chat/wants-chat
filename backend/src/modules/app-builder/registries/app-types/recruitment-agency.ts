/**
 * Recruitment Agency App Type Definition
 *
 * Complete definition for recruitment agency and staffing applications.
 * Essential for staffing agencies, headhunters, and executive search firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECRUITMENT_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'recruitment-agency',
  name: 'Recruitment Agency',
  category: 'professional-services',
  description: 'Recruitment agency platform with candidate tracking, job management, client portal, and placement tracking',
  icon: 'users',

  keywords: [
    'recruitment agency',
    'staffing agency',
    'headhunter',
    'executive search',
    'recruiting firm',
    'recruitment software',
    'ats',
    'applicant tracking',
    'candidate management',
    'staffing software',
    'recruitment crm',
    'job placement',
    'talent acquisition',
    'recruiting agency',
    'temp agency',
    'contract staffing',
    'permanent placement',
    'recruitment portal',
    'recruiting platform',
    'staffing management',
  ],

  synonyms: [
    'recruitment agency platform',
    'recruitment agency software',
    'staffing agency software',
    'recruiting software',
    'ats software',
    'candidate tracking software',
    'staffing management software',
    'executive search software',
    'recruitment crm software',
    'placement tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'internal hr only'],

  sections: [
    { id: 'frontend', name: 'Job Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jobs and applications' },
    { id: 'admin', name: 'Recruiter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'recruiter', layout: 'admin', description: 'Candidates and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Branch Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/placements' },
    { id: 'recruiter', name: 'Recruiter', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/candidates' },
    { id: 'sourcer', name: 'Sourcer', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sourcing' },
    { id: 'client', name: 'Client', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/client' },
    { id: 'candidate', name: 'Candidate', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'dashboard',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a recruitment agency platform',
    'Create a staffing agency app',
    'I need a recruiting software',
    'Build an executive search system',
    'Create a candidate tracking platform',
  ],
};
