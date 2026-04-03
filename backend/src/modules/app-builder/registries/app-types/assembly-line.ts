/**
 * Assembly Line App Type Definition
 *
 * Complete definition for assembly line and production line applications.
 * Essential for assembly operations, line balancing, and work instruction management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSEMBLY_LINE_APP_TYPE: AppTypeDefinition = {
  id: 'assembly-line',
  name: 'Assembly Line',
  category: 'manufacturing',
  description: 'Assembly line platform with work instructions, station management, line balancing, and production tracking',
  icon: 'workflow',

  keywords: [
    'assembly line',
    'production line',
    'assembly management',
    'work instructions',
    'line balancing',
    'assembly stations',
    'assembly tracking',
    'manufacturing line',
    'assembly software',
    'production assembly',
    'workstation management',
    'assembly process',
    'line efficiency',
    'takt time',
    'cycle time',
    'assembly operations',
    'work cell',
    'assembly sequence',
    'build instructions',
    'assembly control',
  ],

  synonyms: [
    'assembly line platform',
    'assembly line software',
    'production line software',
    'assembly management software',
    'work instruction software',
    'line balancing software',
    'assembly tracking software',
    'workstation management software',
    'assembly process software',
    'line management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'assembly language'],

  sections: [
    { id: 'frontend', name: 'Workstation Portal', enabled: true, basePath: '/', layout: 'public', description: 'Work instructions and tasks' },
    { id: 'admin', name: 'Line Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Line management' },
  ],

  roles: [
    { id: 'admin', name: 'Production Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Process Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/processes' },
    { id: 'supervisor', name: 'Line Supervisor', level: 65, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/line' },
    { id: 'lead', name: 'Team Lead', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/stations' },
    { id: 'assembler', name: 'Assembler', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build an assembly line management system',
    'Create a work instruction platform',
    'I need a production line tracking app',
    'Build an assembly workstation system',
    'Create a line balancing platform',
  ],
};
