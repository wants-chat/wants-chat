/**
 * Architecture Firm App Type Definition
 *
 * Complete definition for architecture firm and design practice applications.
 * Essential for architecture firms, design studios, and architectural practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARCHITECTURE_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'architecture-firm',
  name: 'Architecture Firm',
  category: 'professional-services',
  description: 'Architecture firm platform with project management, client portal, drawing management, and billing',
  icon: 'building',

  keywords: [
    'architecture firm',
    'architectural practice',
    'architecture studio',
    'architectural design',
    'architecture software',
    'architect management',
    'architecture projects',
    'architectural drawings',
    'architecture billing',
    'design firm',
    'architecture client',
    'project architect',
    'architecture portfolio',
    'architectural services',
    'building design',
    'architecture proposal',
    'architecture fees',
    'design development',
    'construction documents',
    'architecture practice',
  ],

  synonyms: [
    'architecture firm platform',
    'architecture firm software',
    'architectural practice software',
    'architecture management software',
    'architect project software',
    'architecture studio software',
    'design firm software',
    'architectural billing software',
    'architecture client portal',
    'architecture practice software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'software architecture'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Project status and documents' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'architect', layout: 'admin', description: 'Projects and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'architect', name: 'Architect', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/drawings' },
    { id: 'designer', name: 'Designer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'intern', name: 'Intern', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'dashboard',
    'time-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build an architecture firm platform',
    'Create an architect project management app',
    'I need an architecture client portal',
    'Build an architectural practice system',
    'Create an architecture billing platform',
  ],
};
