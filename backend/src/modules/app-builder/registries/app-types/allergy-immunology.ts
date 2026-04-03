/**
 * Allergy Immunology App Type Definition
 *
 * Complete definition for allergy and immunology practices.
 * Essential for allergists, immunotherapy, and immune health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALLERGY_IMMUNOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'allergy-immunology',
  name: 'Allergy Immunology',
  category: 'healthcare',
  description: 'Allergy platform with skin testing, immunotherapy scheduling, reaction tracking, and allergen management',
  icon: 'shield',

  keywords: [
    'allergy',
    'allergist',
    'allergy software',
    'immunology',
    'allergy testing',
    'allergy management',
    'immunotherapy',
    'allergy practice',
    'allergy scheduling',
    'food allergy',
    'allergy crm',
    'asthma',
    'allergy business',
    'allergy shots',
    'allergy pos',
    'anaphylaxis',
    'allergy operations',
    'skin testing',
    'allergy services',
    'environmental allergy',
  ],

  synonyms: [
    'allergy platform',
    'allergy software',
    'allergist software',
    'immunology software',
    'allergy testing software',
    'immunotherapy software',
    'allergy practice software',
    'food allergy software',
    'allergy shots software',
    'skin testing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Testing and treatment' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Allergist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Allergy Nurse', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/injections' },
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

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an allergy practice platform',
    'Create an immunotherapy tracking app',
    'I need an allergy testing management system',
    'Build an allergist scheduling platform',
    'Create a food allergy management app',
  ],
};
