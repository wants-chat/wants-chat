/**
 * Dog Daycare App Type Definition
 *
 * Complete definition for dog daycare and pet daycare applications.
 * Essential for dog daycares, pet playcare centers, and doggy daycares.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOG_DAYCARE_APP_TYPE: AppTypeDefinition = {
  id: 'dog-daycare',
  name: 'Dog Daycare',
  category: 'pets',
  description: 'Dog daycare platform with check-in/out, playgroup management, report cards, and pet activity tracking',
  icon: 'heart',

  keywords: [
    'dog daycare',
    'pet daycare',
    'doggy daycare',
    'daycare software',
    'pet playcare',
    'daycare booking',
    'dog day care',
    'daycare scheduling',
    'pet care center',
    'daycare crm',
    'dog play',
    'daycare management',
    'pet daycare business',
    'daycare pos',
    'daycare check-in',
    'dog socialization',
    'daycare operations',
    'playgroup management',
    'daily report cards',
    'daycare facility',
  ],

  synonyms: [
    'dog daycare platform',
    'dog daycare software',
    'pet daycare software',
    'doggy daycare software',
    'daycare booking software',
    'pet playcare software',
    'daycare management software',
    'daycare scheduling software',
    'daycare check-in software',
    'pet care center software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'child daycare'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and reports' },
    { id: 'admin', name: 'Daycare Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Dogs and playgroups' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Daycare Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/playgroups' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkin' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'crm',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a dog daycare booking platform',
    'Create a pet daycare management app',
    'I need a doggy daycare check-in system',
    'Build a playgroup management app',
    'Create a dog daycare report card platform',
  ],
};
