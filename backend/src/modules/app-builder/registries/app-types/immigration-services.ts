/**
 * Immigration Services App Type Definition
 *
 * Complete definition for immigration law and visa service operations.
 * Essential for immigration attorneys, visa consultants, and relocation services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IMMIGRATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'immigration-services',
  name: 'Immigration Services',
  category: 'professional-services',
  description: 'Immigration services platform with case tracking, document management, visa applications, and client communication',
  icon: 'globe',

  keywords: [
    'immigration services',
    'immigration attorney',
    'immigration services software',
    'visa consultant',
    'relocation services',
    'immigration services management',
    'case tracking',
    'immigration services practice',
    'immigration services scheduling',
    'document management',
    'immigration services crm',
    'visa applications',
    'immigration services business',
    'client communication',
    'immigration services pos',
    'green card',
    'immigration services operations',
    'work permits',
    'immigration services platform',
    'citizenship applications',
  ],

  synonyms: [
    'immigration services platform',
    'immigration services software',
    'immigration attorney software',
    'visa consultant software',
    'relocation services software',
    'case tracking software',
    'immigration services practice software',
    'document management software',
    'visa applications software',
    'citizenship software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and documents' },
    { id: 'admin', name: 'Office Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Cases and filings' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Attorney', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Immigration Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'documents',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an immigration services platform',
    'Create a visa consulting portal',
    'I need an immigration case management system',
    'Build a document and visa tracking platform',
    'Create a citizenship application app',
  ],
};
