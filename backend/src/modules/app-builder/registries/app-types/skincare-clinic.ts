/**
 * Skincare Clinic App Type Definition
 *
 * Complete definition for skincare clinic and facial spa applications.
 * Essential for skincare clinics, facial spas, and esthetician practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKINCARE_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'skincare-clinic',
  name: 'Skincare Clinic',
  category: 'beauty',
  description: 'Skincare clinic platform with treatment booking, skin analysis tracking, product recommendations, and client progress photos',
  icon: 'heart',

  keywords: [
    'skincare clinic',
    'facial spa',
    'skincare software',
    'esthetician',
    'skincare booking',
    'facial treatments',
    'skin analysis',
    'skincare appointments',
    'skincare studio',
    'skincare business',
    'chemical peels',
    'microdermabrasion',
    'skincare scheduling',
    'skin treatment',
    'skincare crm',
    'hydrafacial',
    'skincare packages',
    'anti-aging treatments',
    'acne treatment',
    'skincare management',
  ],

  synonyms: [
    'skincare clinic platform',
    'skincare clinic software',
    'facial spa software',
    'esthetician software',
    'skincare booking software',
    'skincare scheduling software',
    'skin treatment software',
    'skincare studio software',
    'skincare business software',
    'facial treatment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'dermatology medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and skin journey' },
    { id: 'admin', name: 'Skincare Dashboard', enabled: true, basePath: '/admin', requiredRole: 'esthetician', layout: 'admin', description: 'Treatments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Clinic Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'esthetician', name: 'Esthetician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'gallery',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'subscriptions',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a skincare clinic booking platform',
    'Create a facial spa management app',
    'I need a skincare treatment scheduling system',
    'Build an esthetician practice app',
    'Create a skincare clinic patient portal',
  ],
};
