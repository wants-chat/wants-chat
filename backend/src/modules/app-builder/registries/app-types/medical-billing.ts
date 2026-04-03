/**
 * Medical Billing App Type Definition
 *
 * Complete definition for medical billing service operations.
 * Essential for medical billing companies, revenue cycle management, and healthcare billing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICAL_BILLING_APP_TYPE: AppTypeDefinition = {
  id: 'medical-billing',
  name: 'Medical Billing',
  category: 'healthcare',
  description: 'Medical billing platform with claims processing, denial management, payment posting, and provider reporting',
  icon: 'receipt',

  keywords: [
    'medical billing',
    'revenue cycle',
    'medical billing software',
    'healthcare billing',
    'claims processing',
    'medical billing management',
    'claims processing',
    'medical billing practice',
    'medical billing scheduling',
    'denial management',
    'medical billing crm',
    'payment posting',
    'medical billing business',
    'provider reporting',
    'medical billing pos',
    'coding services',
    'medical billing operations',
    'insurance verification',
    'medical billing platform',
    'ar management',
  ],

  synonyms: [
    'medical billing platform',
    'medical billing software',
    'revenue cycle software',
    'healthcare billing software',
    'claims processing software',
    'claims processing software',
    'medical billing practice software',
    'denial management software',
    'payment posting software',
    'coding services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Provider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and payments' },
    { id: 'admin', name: 'Billing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Claims and AR' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Billing Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/claims' },
    { id: 'specialist', name: 'Billing Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/work-queue' },
    { id: 'provider', name: 'Provider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'insurance-billing',
    'patient-records',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'referrals',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a medical billing platform',
    'Create a revenue cycle management app',
    'I need a healthcare billing system',
    'Build a claims processing app',
    'Create a medical billing portal',
  ],
};
