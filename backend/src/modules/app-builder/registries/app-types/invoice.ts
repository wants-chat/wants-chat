/**
 * Invoice & Billing System App Type Definition
 *
 * Complete definition for invoicing and billing applications.
 * Essential for freelancers, agencies, and small businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVOICE_APP_TYPE: AppTypeDefinition = {
  id: 'invoice',
  name: 'Invoice & Billing System',
  category: 'finance',
  description: 'Invoice creation and billing with clients, payments, estimates, and expense tracking',
  icon: 'file-invoice',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'invoice',
    'invoicing',
    'billing',
    'billing system',
    'invoice software',
    'invoice generator',
    'invoice management',
    'payment tracking',
    'accounts receivable',
    'client billing',
    'freelance invoice',
    'estimate',
    'quote',
    'proposal',
    'freshbooks',
    'wave',
    'zoho invoice',
    'quickbooks',
    'xero',
    'harvest',
    'paypal invoicing',
    'stripe billing',
    'recurring billing',
    'subscription billing',
    'payment reminders',
    'overdue invoices',
    'time billing',
    'expense tracking',
  ],

  synonyms: [
    'billing software',
    'invoice platform',
    'billing platform',
    'accounts software',
    'payment system',
    'invoice tracker',
    'billing tracker',
    'client invoicing',
    'business invoicing',
    'professional invoicing',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
    'fitness',
    'social media',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Client Portal',
      enabled: true,
      basePath: '/client',
      layout: 'public',
      description: 'Client-facing portal for viewing and paying invoices',
    },
    {
      id: 'admin',
      name: 'Billing Dashboard',
      enabled: true,
      basePath: '/',
      requiredRole: 'user',
      layout: 'admin',
      description: 'Invoice creation and financial management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Business Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'accountant',
      name: 'Accountant',
      level: 70,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/invoices',
    },
    {
      id: 'user',
      name: 'Team Member',
      level: 40,
      isDefault: true,
      accessibleSections: ['admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'client',
      name: 'Client',
      level: 20,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/client/invoices',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'clients',
    'notifications',
    'search',
    'reporting',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'dashboard',
    'settings',
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
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'finance',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an invoicing system',
    'Create a billing app for freelancers',
    'I need an invoice generator',
    'Build an app for tracking client payments',
    'Create a billing platform like Freshbooks',
    'I want to build an invoice management system',
    'Make an invoicing app with online payments',
  ],
};
