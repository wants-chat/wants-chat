/**
 * RV Park App Type Definition
 *
 * Complete definition for RV park and campground operations.
 * Essential for RV parks, trailer parks, and mobile home communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'rv-park',
  name: 'RV Park',
  category: 'outdoor',
  description: 'RV park platform with site reservations, hookup management, amenity booking, and long-term stays',
  icon: 'truck',

  keywords: [
    'rv park',
    'trailer park',
    'rv park software',
    'campground',
    'mobile home',
    'rv park management',
    'site reservations',
    'rv park practice',
    'rv park scheduling',
    'hookup management',
    'rv park crm',
    'amenity booking',
    'rv park business',
    'long-term stays',
    'rv park pos',
    'full hookups',
    'rv park operations',
    'seasonal sites',
    'rv park platform',
    'snowbird rentals',
  ],

  synonyms: [
    'rv park platform',
    'rv park software',
    'trailer park software',
    'campground software',
    'mobile home software',
    'site reservations software',
    'rv park practice software',
    'hookup management software',
    'amenity booking software',
    'snowbird rentals software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sites and booking' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sites and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Park Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Park Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkin' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'hospitality',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build an RV park management platform',
    'Create a campground reservation portal',
    'I need an RV site booking system',
    'Build a trailer park management platform',
    'Create a site reservation and amenity app',
  ],
};
