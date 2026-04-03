/**
 * Wellness Center App Type Definition
 *
 * Complete definition for wellness centers and holistic health facilities.
 * Essential for wellness centers, integrative health, and mind-body facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELLNESS_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'wellness-center',
  name: 'Wellness Center',
  category: 'wellness',
  description: 'Wellness center platform with practitioner booking, service management, program enrollment, and client wellness tracking',
  icon: 'heart-pulse',

  keywords: [
    'wellness center',
    'integrative health',
    'wellness center software',
    'mind body',
    'holistic wellness',
    'wellness center management',
    'practitioner booking',
    'wellness center practice',
    'wellness center scheduling',
    'service management',
    'wellness center crm',
    'wellness programs',
    'wellness center business',
    'health coaching',
    'wellness center pos',
    'retreats',
    'wellness center operations',
    'workshops',
    'wellness center platform',
    'preventive health',
  ],

  synonyms: [
    'wellness center platform',
    'wellness center software',
    'integrative health software',
    'mind body software',
    'holistic wellness software',
    'practitioner booking software',
    'wellness center practice software',
    'service management software',
    'wellness programs software',
    'preventive health software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and programs' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Practitioners and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Center Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/practitioners' },
    { id: 'practitioner', name: 'Practitioner', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'trainer-booking',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'body-measurements',
    'nutrition-tracking',
    'fitness-challenges',
    'class-packages',
    'group-training',
    'workout-tracking',
    'analytics',
    'documents',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'wellness',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a wellness center platform',
    'Create an integrative health facility portal',
    'I need a holistic wellness management system',
    'Build a mind-body center platform',
    'Create a practitioner and program booking app',
  ],
};
