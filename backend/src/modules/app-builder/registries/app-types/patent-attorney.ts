/**
 * Patent Attorney App Type Definition
 *
 * Complete definition for patent law and intellectual property operations.
 * Essential for patent attorneys, IP lawyers, and trademark agents.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PATENT_ATTORNEY_APP_TYPE: AppTypeDefinition = {
  id: 'patent-attorney',
  name: 'Patent Attorney',
  category: 'professional-services',
  description: 'Patent attorney platform with application tracking, prior art search, prosecution management, and IP portfolio tracking',
  icon: 'lightbulb',

  keywords: [
    'patent attorney',
    'patent law',
    'patent attorney software',
    'ip lawyer',
    'trademark agent',
    'patent attorney management',
    'application tracking',
    'patent attorney practice',
    'patent attorney scheduling',
    'prior art search',
    'patent attorney crm',
    'prosecution management',
    'patent attorney business',
    'ip portfolio',
    'patent attorney pos',
    'patent filing',
    'patent attorney operations',
    'trademark registration',
    'patent attorney platform',
    'intellectual property',
  ],

  synonyms: [
    'patent attorney platform',
    'patent attorney software',
    'patent law software',
    'ip lawyer software',
    'trademark agent software',
    'application tracking software',
    'patent attorney practice software',
    'prior art search software',
    'prosecution management software',
    'ip portfolio software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Applications and portfolio' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Cases and filings' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Patent Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/applications' },
    { id: 'agent', name: 'Patent Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/prosecution' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'matter-notes',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'client-portal',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a patent attorney platform',
    'Create an IP law firm portal',
    'I need a patent application management system',
    'Build an IP portfolio tracking platform',
    'Create a patent prosecution app',
  ],
};
