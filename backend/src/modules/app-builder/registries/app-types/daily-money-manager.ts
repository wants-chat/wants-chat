/**
 * Daily Money Manager App Type Definition
 *
 * Complete definition for daily money management service operations.
 * Essential for personal finance managers, bill pay services, and financial organization for seniors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DAILY_MONEY_MANAGER_APP_TYPE: AppTypeDefinition = {
  id: 'daily-money-manager',
  name: 'Daily Money Manager',
  category: 'finance',
  description: 'Daily money manager platform with bill payment, account reconciliation, expense tracking, and financial reporting',
  icon: 'wallet',

  keywords: [
    'daily money manager',
    'personal finance manager',
    'daily money manager software',
    'bill pay service',
    'senior finances',
    'daily money manager management',
    'bill payment',
    'daily money manager practice',
    'daily money manager scheduling',
    'account reconciliation',
    'daily money manager crm',
    'expense tracking',
    'daily money manager business',
    'financial reporting',
    'daily money manager pos',
    'bookkeeping',
    'daily money manager operations',
    'insurance claims',
    'daily money manager platform',
    'tax preparation',
  ],

  synonyms: [
    'daily money manager platform',
    'daily money manager software',
    'personal finance manager software',
    'bill pay service software',
    'senior finances software',
    'bill payment software',
    'daily money manager practice software',
    'account reconciliation software',
    'expense tracking software',
    'bookkeeping software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Finances and reports' },
    { id: 'admin', name: 'Manager Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Money Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'assistant', name: 'Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bills' },
    { id: 'client', name: 'Client/Family', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a daily money manager platform',
    'Create a personal finance manager app',
    'I need a bill pay service system',
    'Build a senior finance management app',
    'Create a daily money manager portal',
  ],
};
