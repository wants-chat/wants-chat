/**
 * Community Garden App Type Definition
 *
 * Complete definition for community garden management.
 * Essential for community gardens, urban farms, and garden cooperatives.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMUNITY_GARDEN_APP_TYPE: AppTypeDefinition = {
  id: 'community-garden',
  name: 'Community Garden',
  category: 'community',
  description: 'Community garden platform with plot assignments, member management, task scheduling, and harvest tracking',
  icon: 'leaf',

  keywords: [
    'community garden',
    'urban farm',
    'community garden software',
    'garden cooperative',
    'allotment garden',
    'community garden management',
    'plot assignments',
    'community garden practice',
    'community garden scheduling',
    'member management',
    'community garden crm',
    'task scheduling',
    'community garden business',
    'harvest tracking',
    'community garden pos',
    'shared tools',
    'community garden operations',
    'composting',
    'community garden platform',
    'growing guides',
  ],

  synonyms: [
    'community garden platform',
    'community garden software',
    'urban farm software',
    'garden cooperative software',
    'allotment garden software',
    'plot assignments software',
    'community garden practice software',
    'member management software',
    'task scheduling software',
    'growing guides software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Gardener Portal', enabled: true, basePath: '/', layout: 'public', description: 'Plots and resources' },
    { id: 'admin', name: 'Garden Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Plots and members' },
  ],

  roles: [
    { id: 'admin', name: 'Garden Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Plot Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/plots' },
    { id: 'volunteer', name: 'Lead Volunteer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'member', name: 'Gardener', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'nonprofit',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'organic',

  examplePrompts: [
    'Build a community garden management platform',
    'Create an urban farm portal',
    'I need a garden plot assignment system',
    'Build a garden cooperative platform',
    'Create a member and harvest tracking app',
  ],
};
