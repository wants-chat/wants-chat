/**
 * CNC Machining App Type Definition
 *
 * Complete definition for CNC machining and machine shop applications.
 * Essential for CNC shops, machine shops, and precision manufacturing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CNC_MACHINING_APP_TYPE: AppTypeDefinition = {
  id: 'cnc-machining',
  name: 'CNC Machining',
  category: 'manufacturing',
  description: 'CNC machining platform with job scheduling, machine monitoring, tool management, and program library',
  icon: 'cog',

  keywords: [
    'cnc machining',
    'cnc shop',
    'machine shop',
    'cnc programming',
    'cnc monitoring',
    'machining software',
    'cnc management',
    'tool management',
    'machine scheduling',
    'cnc job shop',
    'precision machining',
    'cnc milling',
    'cnc turning',
    'cnc lathe',
    'machine shop software',
    'machining center',
    'cnc operations',
    'g-code management',
    'cnc tooling',
    'machining jobs',
  ],

  synonyms: [
    'cnc machining platform',
    'cnc machining software',
    'machine shop software',
    'cnc shop software',
    'cnc management software',
    'machining job software',
    'cnc scheduling software',
    'tool management software',
    'cnc monitoring software',
    'precision machining software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general manufacturing'],

  sections: [
    { id: 'frontend', name: 'Shop Floor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Machine status and jobs' },
    { id: 'admin', name: 'CNC Dashboard', enabled: true, basePath: '/admin', requiredRole: 'programmer', layout: 'admin', description: 'Jobs and machines' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'programmer', name: 'CNC Programmer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'setup', name: 'Setup Technician', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/setups' },
    { id: 'operator', name: 'Machine Operator', level: 40, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a CNC shop management system',
    'Create a machine shop platform',
    'I need a CNC job scheduling app',
    'Build a tool management system',
    'Create a CNC program library',
  ],
};
