/**
 * Cybersecurity App Type Definition
 *
 * Complete definition for cybersecurity service provider applications.
 * Essential for cybersecurity firms, MSPs, and security consultants.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CYBERSECURITY_APP_TYPE: AppTypeDefinition = {
  id: 'cybersecurity',
  name: 'Cybersecurity',
  category: 'security',
  description: 'Cybersecurity platform with threat monitoring, vulnerability management, incident response, and compliance reporting',
  icon: 'lock',

  keywords: [
    'cybersecurity',
    'cyber security',
    'security operations',
    'cybersecurity software',
    'threat monitoring',
    'vulnerability management',
    'incident response',
    'security assessment',
    'penetration testing',
    'cybersecurity company',
    'soc',
    'security analyst',
    'cyber threats',
    'security compliance',
    'cybersecurity business',
    'security consulting',
    'risk assessment',
    'security audit',
    'managed security',
    'cyber defense',
  ],

  synonyms: [
    'cybersecurity platform',
    'cybersecurity software',
    'security operations software',
    'threat monitoring software',
    'vulnerability management software',
    'incident response software',
    'security assessment software',
    'soc software',
    'managed security software',
    'cyber defense software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'physical security'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and alerts' },
    { id: 'admin', name: 'Security Dashboard', enabled: true, basePath: '/admin', requiredRole: 'analyst', layout: 'admin', description: 'Threats and incidents' },
  ],

  roles: [
    { id: 'admin', name: 'CISO', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Security Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/incidents' },
    { id: 'analyst', name: 'Security Analyst', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/alerts' },
    { id: 'engineer', name: 'Security Engineer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vulnerabilities' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a cybersecurity platform',
    'Create a threat monitoring app',
    'I need a vulnerability management system',
    'Build a security operations dashboard',
    'Create an incident response platform',
  ],
};
