/**
 * Sauna & Steam App Type Definition
 *
 * Complete definition for sauna and steam room services.
 * Essential for saunas, steam rooms, and heat therapy centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAUNA_STEAM_APP_TYPE: AppTypeDefinition = {
  id: 'sauna-steam',
  name: 'Sauna & Steam',
  category: 'wellness',
  description: 'Sauna and steam platform with room booking, session scheduling, membership management, and facility monitoring',
  icon: 'thermometer',

  keywords: [
    'sauna steam',
    'infrared sauna',
    'sauna steam software',
    'steam room',
    'heat therapy',
    'sauna steam management',
    'room booking',
    'sauna steam practice',
    'sauna steam scheduling',
    'session scheduling',
    'sauna steam crm',
    'finnish sauna',
    'sauna steam business',
    'russian banya',
    'sauna steam pos',
    'korean spa',
    'sauna steam operations',
    'contrast therapy',
    'sauna steam platform',
    'detox wellness',
  ],

  synonyms: [
    'sauna steam platform',
    'sauna steam software',
    'infrared sauna software',
    'steam room software',
    'heat therapy software',
    'room booking software',
    'sauna steam practice software',
    'session scheduling software',
    'finnish sauna software',
    'detox wellness software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and booking' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Rooms and members' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Facility Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rooms' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'scheduling',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a sauna and steam room platform',
    'Create an infrared sauna booking portal',
    'I need a heat therapy center management system',
    'Build a korean spa platform',
    'Create a room booking and membership app',
  ],
};
