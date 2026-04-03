/**
 * Endocrinology App Type Definition
 *
 * Complete definition for endocrinology practices and diabetes centers.
 * Essential for endocrinologists, diabetes management, and hormone health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENDOCRINOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'endocrinology',
  name: 'Endocrinology',
  category: 'healthcare',
  description: 'Endocrinology platform with glucose monitoring, A1C tracking, hormone level management, and diabetes education',
  icon: 'droplet',

  keywords: [
    'endocrinology',
    'endocrinologist',
    'endocrinology software',
    'diabetes',
    'hormone health',
    'endocrinology management',
    'thyroid',
    'endocrinology practice',
    'endocrinology scheduling',
    'insulin',
    'endocrinology crm',
    'metabolism',
    'endocrinology business',
    'A1C',
    'endocrinology pos',
    'glucose',
    'endocrinology operations',
    'CGM',
    'endocrinology services',
    'pituitary',
  ],

  synonyms: [
    'endocrinology platform',
    'endocrinology software',
    'endocrinologist software',
    'diabetes software',
    'hormone health software',
    'thyroid software',
    'endocrinology practice software',
    'insulin software',
    'glucose software',
    'CGM software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Readings and management' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and monitoring' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Endocrinologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Diabetes Educator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/education' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an endocrinology practice platform',
    'Create a diabetes management patient portal',
    'I need a glucose monitoring system',
    'Build an endocrinologist scheduling platform',
    'Create a thyroid care management app',
  ],
};
