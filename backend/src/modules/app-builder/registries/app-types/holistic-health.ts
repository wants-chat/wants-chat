/**
 * Holistic Health App Type Definition
 *
 * Complete definition for holistic health practitioners.
 * Essential for holistic practitioners, natural medicine, and alternative therapy.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOLISTIC_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'holistic-health',
  name: 'Holistic Health',
  category: 'wellness',
  description: 'Holistic health platform with treatment booking, modality management, client intake, and wellness protocols',
  icon: 'leaf',

  keywords: [
    'holistic health',
    'natural medicine',
    'holistic health software',
    'alternative therapy',
    'naturopath',
    'holistic health management',
    'treatment booking',
    'holistic health practice',
    'holistic health scheduling',
    'modality management',
    'holistic health crm',
    'energy healing',
    'holistic health business',
    'functional medicine',
    'holistic health pos',
    'ayurveda',
    'holistic health operations',
    'traditional chinese',
    'holistic health platform',
    'herbal medicine',
  ],

  synonyms: [
    'holistic health platform',
    'holistic health software',
    'natural medicine software',
    'alternative therapy software',
    'naturopath software',
    'treatment booking software',
    'holistic health practice software',
    'modality management software',
    'energy healing software',
    'herbal medicine software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Treatments and booking' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and protocols' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'practitioner', name: 'Lead Practitioner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Practitioner', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'healthcare',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'organic',

  examplePrompts: [
    'Build a holistic health practice platform',
    'Create a naturopath booking portal',
    'I need an alternative therapy management system',
    'Build a natural medicine practice platform',
    'Create a client intake and protocol app',
  ],
};
