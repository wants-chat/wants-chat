/**
 * Cybersecurity Firm App Type Definition
 *
 * Complete definition for cybersecurity firm operations.
 * Essential for cybersecurity consultants, IT security firms, and penetration testing companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CYBERSECURITY_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'cybersecurity-firm',
  name: 'Cybersecurity Firm',
  category: 'professional-services',
  description: 'Cybersecurity platform with project management, vulnerability tracking, report generation, and client assessments',
  icon: 'lock',

  keywords: [
    'cybersecurity firm',
    'it security',
    'cybersecurity firm software',
    'penetration testing',
    'security consulting',
    'cybersecurity firm management',
    'project management',
    'cybersecurity firm practice',
    'cybersecurity firm scheduling',
    'vulnerability tracking',
    'cybersecurity firm crm',
    'report generation',
    'cybersecurity firm business',
    'client assessments',
    'cybersecurity firm pos',
    'security audit',
    'cybersecurity firm operations',
    'compliance testing',
    'cybersecurity firm platform',
    'incident response',
  ],

  synonyms: [
    'cybersecurity firm platform',
    'cybersecurity firm software',
    'it security software',
    'penetration testing software',
    'security consulting software',
    'project management software',
    'cybersecurity firm practice software',
    'vulnerability tracking software',
    'report generation software',
    'security audit software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and assessments' },
    { id: 'admin', name: 'Security Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and findings' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'consultant', name: 'Security Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'analyst', name: 'Security Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assessments' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build a cybersecurity firm platform',
    'Create an IT security consulting app',
    'I need a penetration testing company system',
    'Build a security consulting firm app',
    'Create a cybersecurity firm portal',
  ],
};
