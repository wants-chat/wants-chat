/**
 * Legal Practice App Type Definition
 *
 * Complete definition for legal practice management applications.
 * Essential for law firms, attorneys, and legal service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEGAL_APP_TYPE: AppTypeDefinition = {
  id: 'legal',
  name: 'Legal Practice Management',
  category: 'professional',
  description: 'Law practice management with cases, clients, documents, billing, and client portal',
  icon: 'scale-balanced',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'legal',
    'law firm',
    'law practice',
    'attorney',
    'lawyer',
    'legal practice',
    'case management',
    'legal case',
    'client intake',
    'legal billing',
    'legal documents',
    'clio',
    'mycase',
    'lawmatics',
    'practice panther',
    'smokeball',
    'legal software',
    'law software',
    'legal crm',
    'legal portal',
    'client portal',
    'matter management',
    'litigation',
    'legal services',
    'paralegal',
    'court',
    'contract management',
  ],

  synonyms: [
    'law firm software',
    'legal management',
    'attorney software',
    'legal platform',
    'law practice management',
    'legal system',
    'case tracker',
    'legal crm',
    'law practice software',
    'legal practice software',
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
      name: 'Client Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Client-facing portal for case updates and documents',
    },
    {
      id: 'admin',
      name: 'Practice Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Legal practice management and case handling',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Managing Partner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'attorney',
      name: 'Attorney',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/cases',
    },
    {
      id: 'staff',
      name: 'Paralegal/Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/tasks',
    },
    {
      id: 'client',
      name: 'Client',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/my-cases',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'billing-timekeeping',
    'documents',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'document-assembly',
    'court-calendar',
    'conflict-check',
    'matter-notes',
    'client-portal',
    'payments',
    'reporting',
    'email',
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
  industry: 'legal',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a law practice management system',
    'Create a legal case management app',
    'I need a law firm management platform',
    'Build a client portal for my law firm',
    'Create a legal billing system',
    'I want to build a case management system',
    'Make a legal software like Clio',
  ],
};
