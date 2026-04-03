/**
 * Waxing Salon App Type Definition
 *
 * Complete definition for waxing salon operations.
 * Essential for waxing studios, hair removal centers, and esthetician practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAXING_SALON_APP_TYPE: AppTypeDefinition = {
  id: 'waxing-salon',
  name: 'Waxing Salon',
  category: 'beauty',
  description: 'Waxing salon platform with appointment scheduling, service packages, client history, and aftercare tracking',
  icon: 'sparkles',

  keywords: [
    'waxing salon',
    'waxing studio',
    'waxing salon software',
    'hair removal',
    'esthetician',
    'waxing salon management',
    'appointment scheduling',
    'waxing salon practice',
    'waxing salon scheduling',
    'service packages',
    'waxing salon crm',
    'client history',
    'waxing salon business',
    'aftercare tracking',
    'waxing salon pos',
    'brazilian wax',
    'waxing salon operations',
    'sugaring',
    'waxing salon platform',
    'full body wax',
  ],

  synonyms: [
    'waxing salon platform',
    'waxing salon software',
    'waxing studio software',
    'hair removal software',
    'esthetician software',
    'appointment scheduling software',
    'waxing salon practice software',
    'service packages software',
    'client history software',
    'sugaring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and packages' },
    { id: 'admin', name: 'Salon Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Salon Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'esthetician', name: 'Esthetician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'receptionist', name: 'Receptionist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a waxing salon platform',
    'Create a waxing studio portal',
    'I need a waxing salon management system',
    'Build an appointment scheduling platform',
    'Create a client history and packages app',
  ],
};
