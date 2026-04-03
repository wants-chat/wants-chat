/**
 * Insurance Quote App Type Definition
 *
 * Complete definition for insurance quote and policy management applications.
 * Essential for insurance agencies, brokers, and insurance companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'insurance',
  name: 'Insurance Quote & Policy',
  category: 'finance',
  description: 'Insurance platform with quote generation, policy management, claims, and customer portal',
  icon: 'shield-check',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'insurance',
    'insurance quote',
    'insurance policy',
    'policy management',
    'quote generator',
    'insurance agency',
    'insurance broker',
    'claims',
    'claims management',
    'auto insurance',
    'car insurance',
    'home insurance',
    'life insurance',
    'health insurance',
    'business insurance',
    'geico',
    'progressive',
    'allstate',
    'insurance crm',
    'insurance portal',
    'policyholder',
    'underwriting',
    'premium',
    'coverage',
    'insurance marketplace',
    'insurtech',
  ],

  synonyms: [
    'insurance platform',
    'insurance software',
    'insurance system',
    'quote platform',
    'policy platform',
    'insurance management',
    'agency software',
    'broker software',
    'insurance app',
    'quote app',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Customer Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Customer-facing quote and policy portal',
    },
    {
      id: 'admin',
      name: 'Agency Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'agent',
      layout: 'admin',
      description: 'Insurance agency management and operations',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Agency Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/policies',
    },
    {
      id: 'agent',
      name: 'Insurance Agent',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/quotes',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/my-policies',
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
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
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
  complexity: 'complex',
  industry: 'finance',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an insurance quote platform',
    'Create an insurance policy management system',
    'I need an insurance agency software',
    'Build a quote generator for insurance',
    'Create an insurance portal with claims',
    'I want to build an insurtech platform',
    'Make an insurance app with customer portal',
  ],
};
