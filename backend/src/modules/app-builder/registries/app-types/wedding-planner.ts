/**
 * Wedding Planner App Type Definition
 *
 * Complete definition for wedding planning and coordination services.
 * Essential for wedding planners, coordinators, and bridal consultants.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_PLANNER_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-planner',
  name: 'Wedding Planner',
  category: 'events',
  description: 'Wedding planning platform with vendor management, timeline coordination, budget tracking, and guest list management',
  icon: 'heart',

  keywords: [
    'wedding planner',
    'wedding planning',
    'wedding planner software',
    'bridal consultant',
    'wedding coordinator',
    'wedding planner management',
    'vendor management',
    'wedding planner practice',
    'wedding planner scheduling',
    'guest list',
    'wedding planner crm',
    'wedding budget',
    'wedding planner business',
    'wedding timeline',
    'wedding planner pos',
    'ceremony planning',
    'wedding planner operations',
    'reception planning',
    'wedding planner services',
    'bridal services',
  ],

  synonyms: [
    'wedding planner platform',
    'wedding planner software',
    'wedding planning software',
    'bridal consultant software',
    'wedding coordinator software',
    'vendor management software',
    'wedding planner practice software',
    'guest list software',
    'wedding budget software',
    'bridal services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Wedding planning and details' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Weddings and vendors' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Wedding Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/weddings' },
    { id: 'coordinator', name: 'Day-of Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
    { id: 'client', name: 'Couple', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'team-management',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'inventory-retail', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a wedding planning platform',
    'Create a bridal consultant portal',
    'I need a wedding coordinator management system',
    'Build a wedding planner business platform',
    'Create a vendor and guest management app',
  ],
};
