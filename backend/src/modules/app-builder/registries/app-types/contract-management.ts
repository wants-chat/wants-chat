/**
 * Contract Management App Type Definition
 *
 * Complete definition for contract lifecycle management operations.
 * Essential for legal departments, procurement teams, and contract administrators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONTRACT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'contract-management',
  name: 'Contract Management',
  category: 'professional-services',
  description: 'Contract management platform with lifecycle tracking, template library, approval workflows, and obligation monitoring',
  icon: 'file-text',

  keywords: [
    'contract management',
    'contract lifecycle',
    'contract management software',
    'clm software',
    'legal operations',
    'contract management system',
    'lifecycle tracking',
    'contract management practice',
    'contract management scheduling',
    'template library',
    'contract management crm',
    'approval workflows',
    'contract management business',
    'obligation monitoring',
    'contract management pos',
    'vendor contracts',
    'contract management operations',
    'sales contracts',
    'contract management platform',
    'compliance tracking',
  ],

  synonyms: [
    'contract management platform',
    'contract management software',
    'contract lifecycle software',
    'clm software solution',
    'legal operations software',
    'lifecycle tracking software',
    'contract management practice software',
    'template library software',
    'approval workflows software',
    'obligation monitoring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'User Portal', enabled: true, basePath: '/', layout: 'public', description: 'Contracts and requests' },
    { id: 'admin', name: 'CLM Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Contracts and workflows' },
  ],

  roles: [
    { id: 'admin', name: 'Legal Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Contract Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/contracts' },
    { id: 'analyst', name: 'Contract Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/templates' },
    { id: 'user', name: 'Requester', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'workflow',
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

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a contract management platform',
    'Create a CLM system',
    'I need a contract lifecycle management system',
    'Build a contract workflow platform',
    'Create a template and obligation tracking app',
  ],
};
