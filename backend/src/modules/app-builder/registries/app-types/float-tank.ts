/**
 * Float Tank App Type Definition
 *
 * Complete definition for float tank and sensory deprivation services.
 * Essential for float centers, isolation tanks, and flotation therapy.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOAT_TANK_APP_TYPE: AppTypeDefinition = {
  id: 'float-tank',
  name: 'Float Tank',
  category: 'wellness',
  description: 'Float tank platform with tank scheduling, session booking, water quality tracking, and membership packages',
  icon: 'droplet',

  keywords: [
    'float tank',
    'sensory deprivation',
    'float tank software',
    'isolation tank',
    'flotation therapy',
    'float tank management',
    'tank scheduling',
    'float tank practice',
    'float tank booking',
    'session booking',
    'float tank crm',
    'float spa',
    'float tank business',
    'meditation pods',
    'float tank pos',
    'epsom salt',
    'float tank operations',
    'zero gravity',
    'float tank platform',
    'rest therapy',
  ],

  synonyms: [
    'float tank platform',
    'float tank software',
    'sensory deprivation software',
    'isolation tank software',
    'flotation therapy software',
    'tank scheduling software',
    'float tank practice software',
    'session booking software',
    'float spa software',
    'rest therapy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and booking' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tanks and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Center Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Float Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tanks' },
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
    'discounts',
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a float tank center platform',
    'Create a sensory deprivation booking portal',
    'I need a flotation therapy scheduling system',
    'Build a float spa management platform',
    'Create a tank booking and membership app',
  ],
};
