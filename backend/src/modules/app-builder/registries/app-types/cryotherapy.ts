/**
 * Cryotherapy App Type Definition
 *
 * Complete definition for cryotherapy and cold therapy center applications.
 * Essential for cryo centers, cryotherapy studios, and recovery facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRYOTHERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'cryotherapy',
  name: 'Cryotherapy',
  category: 'wellness',
  description: 'Cryotherapy center platform with session booking, treatment tracking, safety protocols, and membership management',
  icon: 'snowflake',

  keywords: [
    'cryotherapy',
    'cryo center',
    'cryotherapy software',
    'cryo booking',
    'cold therapy',
    'cryotherapy studio',
    'whole body cryo',
    'localized cryo',
    'cryo sessions',
    'cryo scheduling',
    'cryotherapy treatment',
    'cryo chamber',
    'cryotherapy memberships',
    'cryo spa',
    'cryotherapy appointments',
    'cryo recovery',
    'cryotherapy business',
    'cryo facial',
    'cryo wellness',
    'cryotherapy center',
  ],

  synonyms: [
    'cryotherapy platform',
    'cryotherapy software',
    'cryo center software',
    'cryotherapy booking software',
    'cryo scheduling software',
    'cold therapy software',
    'cryotherapy management software',
    'cryo session software',
    'cryotherapy studio software',
    'cryo treatment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'cryotherapy research'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and treatments' },
    { id: 'admin', name: 'Cryo Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Sessions and safety' },
  ],

  roles: [
    { id: 'admin', name: 'Center Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Cryo Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'gallery',
    'analytics',
    'reminders',
    'reviews',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a cryotherapy center platform',
    'Create a cryo booking app',
    'I need a cryotherapy session management system',
    'Build a cold therapy center app',
    'Create a cryo spa management platform',
  ],
};
