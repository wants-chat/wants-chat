/**
 * Hospice App Type Definition
 *
 * Complete definition for hospice care and palliative care services.
 * Essential for hospice agencies, palliative care, and end-of-life care.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOSPICE_APP_TYPE: AppTypeDefinition = {
  id: 'hospice',
  name: 'Hospice',
  category: 'seniors',
  description: 'Hospice care platform with patient management, care coordination, family support, and visit documentation',
  icon: 'heart-handshake',

  keywords: [
    'hospice',
    'hospice care',
    'hospice software',
    'palliative care',
    'hospice agency',
    'hospice management',
    'end of life',
    'hospice services',
    'hospice scheduling',
    'comfort care',
    'hospice crm',
    'hospice nursing',
    'hospice business',
    'terminal care',
    'hospice pos',
    'bereavement',
    'hospice operations',
    'hospice visits',
    'hospice team',
    'symptom management',
  ],

  synonyms: [
    'hospice platform',
    'hospice software',
    'hospice care software',
    'palliative care software',
    'hospice agency software',
    'end of life care software',
    'hospice services software',
    'comfort care software',
    'hospice management software',
    'terminal care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general hospital'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Care updates and support' },
    { id: 'admin', name: 'Hospice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'nurse', layout: 'admin', description: 'Patients and care teams' },
  ],

  roles: [
    { id: 'admin', name: 'Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Clinical Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'nurse', name: 'Hospice Nurse', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
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
    'team-management',
    'reporting',
    'analytics',
    'insurance-billing',
    'referrals',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'seniors',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'calm',

  examplePrompts: [
    'Build a hospice care platform',
    'Create a palliative care management app',
    'I need a hospice agency scheduling system',
    'Build a hospice family communication portal',
    'Create an end-of-life care coordination platform',
  ],
};
