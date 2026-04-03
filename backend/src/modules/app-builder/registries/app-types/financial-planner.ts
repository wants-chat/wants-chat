/**
 * Financial Planner App Type Definition
 *
 * Complete definition for financial planning practice operations.
 * Essential for financial planners, CFPs, and wealth advisors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FINANCIAL_PLANNER_APP_TYPE: AppTypeDefinition = {
  id: 'financial-planner',
  name: 'Financial Planner',
  category: 'finance',
  description: 'Financial planner platform with client management, plan creation, goal tracking, and document storage',
  icon: 'calculator',

  keywords: [
    'financial planner',
    'cfp',
    'financial planner software',
    'wealth advisor',
    'retirement planning',
    'financial planner management',
    'client management',
    'financial planner practice',
    'financial planner scheduling',
    'plan creation',
    'financial planner crm',
    'goal tracking',
    'financial planner business',
    'document storage',
    'financial planner pos',
    'estate planning',
    'financial planner operations',
    'investment planning',
    'financial planner platform',
    'tax planning',
  ],

  synonyms: [
    'financial planner platform',
    'financial planner software',
    'cfp software',
    'wealth advisor software',
    'retirement planning software',
    'client management software',
    'financial planner practice software',
    'plan creation software',
    'goal tracking software',
    'investment planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Plans and goals' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and plans' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Financial Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Planner', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/plans' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a financial planner platform',
    'Create a CFP practice portal',
    'I need a financial planning system',
    'Build a client and goal tracking platform',
    'Create a wealth planning app',
  ],
};
