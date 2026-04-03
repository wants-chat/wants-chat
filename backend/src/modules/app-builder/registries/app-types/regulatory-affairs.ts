/**
 * Regulatory Affairs App Type Definition
 *
 * Complete definition for regulatory affairs and compliance operations.
 * Essential for regulatory affairs professionals, pharma companies, and medical device firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REGULATORY_AFFAIRS_APP_TYPE: AppTypeDefinition = {
  id: 'regulatory-affairs',
  name: 'Regulatory Affairs',
  category: 'professional-services',
  description: 'Regulatory affairs platform with submission tracking, approval management, labeling compliance, and global registrations',
  icon: 'clipboard-check',

  keywords: [
    'regulatory affairs',
    'regulatory compliance',
    'regulatory affairs software',
    'pharma regulatory',
    'medical device',
    'regulatory affairs management',
    'submission tracking',
    'regulatory affairs practice',
    'regulatory affairs scheduling',
    'approval management',
    'regulatory affairs crm',
    'labeling compliance',
    'regulatory affairs business',
    'global registrations',
    'regulatory affairs pos',
    'fda submissions',
    'regulatory affairs operations',
    'ema compliance',
    'regulatory affairs platform',
    'clinical trials',
  ],

  synonyms: [
    'regulatory affairs platform',
    'regulatory affairs software',
    'regulatory compliance software',
    'pharma regulatory software',
    'medical device software',
    'submission tracking software',
    'regulatory affairs practice software',
    'approval management software',
    'labeling compliance software',
    'global registrations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Stakeholder Portal', enabled: true, basePath: '/', layout: 'public', description: 'Status and documents' },
    { id: 'admin', name: 'RA Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Submissions and approvals' },
  ],

  roles: [
    { id: 'admin', name: 'VP Regulatory', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'RA Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/submissions' },
    { id: 'specialist', name: 'RA Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'viewer', name: 'Stakeholder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a regulatory affairs platform',
    'Create an FDA submission portal',
    'I need a regulatory compliance management system',
    'Build a global registration platform',
    'Create a labeling and approval tracking app',
  ],
};
