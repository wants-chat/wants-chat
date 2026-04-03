/**
 * Investment Firm App Type Definition
 *
 * Complete definition for investment management firm operations.
 * Essential for investment firms, asset managers, and wealth management companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVESTMENT_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'investment-firm',
  name: 'Investment Firm',
  category: 'finance',
  description: 'Investment firm platform with portfolio management, client reporting, trade execution, and compliance tracking',
  icon: 'trending-up',

  keywords: [
    'investment firm',
    'asset management',
    'investment firm software',
    'wealth management',
    'portfolio management',
    'investment firm management',
    'client reporting',
    'investment firm practice',
    'investment firm scheduling',
    'trade execution',
    'investment firm crm',
    'compliance tracking',
    'investment firm business',
    'performance analytics',
    'investment firm pos',
    'hedge fund',
    'investment firm operations',
    'private equity',
    'investment firm platform',
    'fund administration',
  ],

  synonyms: [
    'investment firm platform',
    'investment firm software',
    'asset management software',
    'wealth management software',
    'portfolio management software',
    'client reporting software',
    'investment firm practice software',
    'trade execution software',
    'compliance tracking software',
    'fund administration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Investor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Portfolio and reports' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Portfolios and trades' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Portfolio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/portfolios' },
    { id: 'analyst', name: 'Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/research' },
    { id: 'investor', name: 'Investor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an investment firm platform',
    'Create an asset management portal',
    'I need a portfolio management system',
    'Build a client reporting platform',
    'Create a trade execution app',
  ],
};
