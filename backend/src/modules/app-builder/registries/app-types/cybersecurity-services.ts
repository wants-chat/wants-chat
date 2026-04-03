/**
 * Cybersecurity Services App Type Definition
 *
 * Complete definition for cybersecurity service operations.
 * Essential for security consultants, penetration testers, and IT security firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CYBERSECURITY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'cybersecurity-services',
  name: 'Cybersecurity Services',
  category: 'services',
  description: 'Cybersecurity platform with assessment scheduling, vulnerability tracking, compliance reporting, and client portals',
  icon: 'shield-check',

  keywords: [
    'cybersecurity services',
    'security consultant',
    'cybersecurity services software',
    'penetration testing',
    'it security',
    'cybersecurity services management',
    'assessment scheduling',
    'cybersecurity services practice',
    'cybersecurity services scheduling',
    'vulnerability tracking',
    'cybersecurity services crm',
    'compliance reporting',
    'cybersecurity services business',
    'client portals',
    'cybersecurity services pos',
    'security audits',
    'cybersecurity services operations',
    'threat assessment',
    'cybersecurity services platform',
    'incident response',
  ],

  synonyms: [
    'cybersecurity services platform',
    'cybersecurity services software',
    'security consultant software',
    'penetration testing software',
    'it security software',
    'assessment scheduling software',
    'cybersecurity services practice software',
    'vulnerability tracking software',
    'compliance reporting software',
    'security audits software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and compliance' },
    { id: 'admin', name: 'Security Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Assessments and findings' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'analyst', name: 'Security Analyst', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/assessments' },
    { id: 'consultant', name: 'Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'secure',

  examplePrompts: [
    'Build a cybersecurity services platform',
    'Create a security consulting portal',
    'I need a cybersecurity management system',
    'Build a vulnerability tracking platform',
    'Create an assessment and compliance app',
  ],
};
