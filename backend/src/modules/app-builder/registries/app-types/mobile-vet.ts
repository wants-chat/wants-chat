/**
 * Mobile Vet App Type Definition
 *
 * Complete definition for mobile veterinary service operations.
 * Essential for house call vets, mobile vet clinics, and at-home pet care services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_VET_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-vet',
  name: 'Mobile Vet',
  category: 'healthcare',
  description: 'Mobile vet platform with house call scheduling, route planning, patient records, and on-site treatment tracking',
  icon: 'car',

  keywords: [
    'mobile vet',
    'house call vet',
    'mobile vet software',
    'home vet service',
    'mobile veterinary',
    'mobile vet management',
    'house call scheduling',
    'mobile vet practice',
    'mobile vet scheduling',
    'route planning',
    'mobile vet crm',
    'patient records',
    'mobile vet business',
    'on-site treatment',
    'mobile vet pos',
    'home euthanasia',
    'mobile vet operations',
    'wellness visits',
    'mobile vet platform',
    'senior pet care',
  ],

  synonyms: [
    'mobile vet platform',
    'mobile vet software',
    'house call vet software',
    'home vet service software',
    'mobile veterinary software',
    'house call scheduling software',
    'mobile vet practice software',
    'route planning software',
    'patient records software',
    'wellness visits software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Pet Owner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and care' },
    { id: 'admin', name: 'Mobile Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and patients' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'veterinarian', name: 'Mobile Veterinarian', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'technician', name: 'Vet Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/routes' },
    { id: 'client', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'prescriptions',
    'immunizations',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'treatment-plans',
    'vital-signs',
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
    'Build a mobile vet platform',
    'Create a house call vet app',
    'I need a mobile veterinary system',
    'Build a home pet care service app',
    'Create a mobile vet portal',
  ],
};
