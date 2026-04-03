/**
 * Massage Therapy App Type Definition
 *
 * Complete definition for massage therapy practice applications.
 * Essential for massage therapists, massage clinics, and bodywork practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MASSAGE_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'massage-therapy',
  name: 'Massage Therapy',
  category: 'wellness',
  description: 'Massage therapy platform with booking, client intake, treatment tracking, and practice management',
  icon: 'hand',

  keywords: [
    'massage therapy',
    'massage therapist',
    'massage software',
    'massage booking',
    'massage practice',
    'massage scheduling',
    'bodywork',
    'therapeutic massage',
    'sports massage',
    'deep tissue massage',
    'massage clinic',
    'massage appointments',
    'massage business',
    'massage intake forms',
    'massage client management',
    'massage treatment',
    'massage sessions',
    'mobile massage',
    'massage studio',
    'massage center',
  ],

  synonyms: [
    'massage therapy platform',
    'massage therapy software',
    'massage booking software',
    'massage scheduling software',
    'massage practice software',
    'bodywork software',
    'massage therapist software',
    'massage clinic software',
    'massage appointment software',
    'massage management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'massage chair'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and history' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'therapist', layout: 'admin', description: 'Sessions and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'therapist', name: 'Massage Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'receptionist', name: 'Receptionist', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'feedback',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'waitlist',
    'reviews',
    'reminders',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build a massage therapy booking platform',
    'Create a massage therapist practice app',
    'I need a massage scheduling system',
    'Build a bodywork practice app',
    'Create a massage clinic management app',
  ],
};
