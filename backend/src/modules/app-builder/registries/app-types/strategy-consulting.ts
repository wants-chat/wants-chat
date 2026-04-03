/**
 * Strategy Consulting App Type Definition
 *
 * Complete definition for strategy consulting and corporate advisory firms.
 * Essential for corporate strategy, market analysis, and business transformation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRATEGY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'strategy-consulting',
  name: 'Strategy Consulting',
  category: 'professional-services',
  description: 'Strategy consulting platform with market analysis, competitive intelligence, scenario planning, and strategic initiative tracking',
  icon: 'target',

  keywords: [
    'strategy consulting',
    'corporate strategy',
    'strategy consulting software',
    'business strategy',
    'strategic planning',
    'strategy consulting management',
    'market analysis',
    'strategy consulting practice',
    'strategy consulting scheduling',
    'competitive intelligence',
    'strategy consulting crm',
    'M&A advisory',
    'strategy consulting business',
    'growth strategy',
    'strategy consulting pos',
    'market entry',
    'strategy consulting operations',
    'scenario planning',
    'strategy consulting services',
    'business transformation',
  ],

  synonyms: [
    'strategy consulting platform',
    'strategy consulting software',
    'corporate strategy software',
    'business strategy software',
    'strategic planning software',
    'market analysis software',
    'strategy consulting practice software',
    'competitive intelligence software',
    'M&A advisory software',
    'business transformation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Strategy and insights' },
    { id: 'admin', name: 'Strategy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and engagements' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'partner', name: 'Partner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/engagements' },
    { id: 'consultant', name: 'Strategy Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a strategy consulting platform',
    'Create a corporate strategy advisory portal',
    'I need a strategic planning consulting system',
    'Build a strategy consulting practice platform',
    'Create a competitive intelligence app',
  ],
};
