/**
 * Law Firm App Type Definition
 *
 * Complete definition for law firm operations.
 * Essential for legal practices, attorneys, and legal service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAW_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'law-firm',
  name: 'Law Firm',
  category: 'professional-services',
  description: 'Law firm platform with case management, client intake, billing tracking, and document management',
  icon: 'scale',

  keywords: [
    'law firm',
    'legal practice',
    'law firm software',
    'attorney',
    'legal services',
    'law firm management',
    'case management',
    'law firm practice',
    'law firm scheduling',
    'client intake',
    'law firm crm',
    'billing tracking',
    'law firm business',
    'document management',
    'law firm pos',
    'litigation',
    'law firm operations',
    'legal research',
    'law firm platform',
    'court filings',
  ],

  synonyms: [
    'law firm platform',
    'law firm software',
    'legal practice software',
    'attorney software',
    'legal services software',
    'case management software',
    'law firm practice software',
    'client intake software',
    'billing tracking software',
    'litigation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and documents' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Cases and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'billing-timekeeping',
    'documents',
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
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a law firm platform',
    'Create a legal practice portal',
    'I need a law firm management system',
    'Build a case management platform',
    'Create a billing and document app',
  ],
};
