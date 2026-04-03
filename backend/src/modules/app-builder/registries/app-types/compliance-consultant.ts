/**
 * Compliance Consultant App Type Definition
 *
 * Complete definition for compliance consulting service operations.
 * Essential for compliance officers, regulatory consultants, and audit firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMPLIANCE_CONSULTANT_APP_TYPE: AppTypeDefinition = {
  id: 'compliance-consultant',
  name: 'Compliance Consultant',
  category: 'professional-services',
  description: 'Compliance consulting platform with audit management, policy tracking, risk assessment, and regulatory monitoring',
  icon: 'shield-check',

  keywords: [
    'compliance consultant',
    'compliance consulting',
    'compliance consultant software',
    'regulatory consultant',
    'audit firm',
    'compliance consultant management',
    'audit management',
    'compliance consultant practice',
    'compliance consultant scheduling',
    'policy tracking',
    'compliance consultant crm',
    'risk assessment',
    'compliance consultant business',
    'regulatory monitoring',
    'compliance consultant pos',
    'gdpr compliance',
    'compliance consultant operations',
    'sox compliance',
    'compliance consultant platform',
    'hipaa compliance',
  ],

  synonyms: [
    'compliance consultant platform',
    'compliance consultant software',
    'compliance consulting software',
    'regulatory consultant software',
    'audit firm software',
    'audit management software',
    'compliance consultant practice software',
    'policy tracking software',
    'risk assessment software',
    'regulatory monitoring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and audits' },
    { id: 'admin', name: 'Consultant Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and assessments' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Consultant', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'consultant', name: 'Compliance Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/audits' },
    { id: 'analyst', name: 'Compliance Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assessments' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a compliance consulting platform',
    'Create a regulatory compliance portal',
    'I need a compliance audit management system',
    'Build a risk assessment platform',
    'Create a policy tracking and monitoring app',
  ],
};
