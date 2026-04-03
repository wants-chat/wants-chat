/**
 * Hospice Care App Type Definition
 *
 * Complete definition for hospice care operations.
 * Essential for hospice agencies, palliative care services, and end-of-life care providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOSPICE_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'hospice-care',
  name: 'Hospice Care',
  category: 'healthcare',
  description: 'Hospice care platform with patient management, care coordination, family support, and interdisciplinary team scheduling',
  icon: 'heart-handshake',

  keywords: [
    'hospice care',
    'palliative care',
    'hospice care software',
    'end of life care',
    'comfort care',
    'hospice care management',
    'patient management',
    'hospice care practice',
    'hospice care scheduling',
    'care coordination',
    'hospice care crm',
    'family support',
    'hospice care business',
    'team scheduling',
    'hospice care pos',
    'symptom management',
    'hospice care operations',
    'bereavement services',
    'hospice care platform',
    'home hospice',
  ],

  synonyms: [
    'hospice care platform',
    'hospice care software',
    'palliative care software',
    'end of life care software',
    'comfort care software',
    'patient management software',
    'hospice care practice software',
    'care coordination software',
    'family support software',
    'symptom management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Care and support' },
    { id: 'admin', name: 'Care Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and team' },
  ],

  roles: [
    { id: 'admin', name: 'Hospice Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'nurse', name: 'Hospice Nurse', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'aide', name: 'Hospice Aide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'prescriptions',
    'vital-signs',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'insurance-billing',
    'referrals',
    'telemedicine',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'lavender',
  defaultDesignVariant: 'serene',

  examplePrompts: [
    'Build a hospice care platform',
    'Create a palliative care app',
    'I need a hospice management system',
    'Build an end-of-life care app',
    'Create a hospice care portal',
  ],
};
