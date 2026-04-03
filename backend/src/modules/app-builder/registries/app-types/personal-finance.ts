/**
 * Personal Finance App Type Definition
 *
 * Complete definition for personal finance and budgeting applications.
 * Essential for individuals tracking expenses, budgets, and financial goals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_FINANCE_APP_TYPE: AppTypeDefinition = {
  id: 'personal-finance',
  name: 'Personal Finance',
  category: 'finance',
  description: 'Personal finance management with budgeting, expense tracking, and financial goals',
  icon: 'wallet',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'personal finance',
    'budgeting',
    'budget app',
    'expense tracking',
    'expense tracker',
    'money management',
    'finance tracker',
    'spending tracker',
    'income tracker',
    'savings tracker',
    'financial goals',
    'mint',
    'ynab',
    'personal capital',
    'you need a budget',
    'money app',
    'budget planner',
    'financial planner',
    'expense manager',
    'bank tracking',
    'account tracking',
    'net worth',
    'financial dashboard',
    'money tracker',
    'bill tracking',
    'debt tracker',
    'investment tracking',
  ],

  synonyms: [
    'budget tracker',
    'finance app',
    'money tracker',
    'expense app',
    'budgeting app',
    'financial tracker',
    'spending app',
    'personal money',
    'finance manager',
    'money manager',
  ],

  negativeKeywords: [
    'business finance',
    'enterprise',
    'blog',
    'portfolio',
    'ecommerce',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Finance Dashboard',
      enabled: true,
      basePath: '/',
      layout: 'admin',
      description: 'Personal finance dashboard and tracking',
    },
    {
      id: 'admin',
      name: 'Settings',
      enabled: true,
      basePath: '/settings',
      requiredRole: 'user',
      layout: 'admin',
      description: 'Account and app settings',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'user',
      name: 'User',
      level: 50,
      isDefault: true,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'family',
      name: 'Family Member',
      level: 30,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'categories',
    'dashboard',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'reporting',
    'tags',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: false,
  complexity: 'moderate',
  industry: 'finance',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a personal finance app',
    'Create a budgeting app like Mint',
    'I need an expense tracking app',
    'Build a money management app',
    'Create a budget planner application',
    'I want to build a financial tracker',
    'Make an app to track my spending and savings',
  ],
};
