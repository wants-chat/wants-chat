/**
 * Auto Glass App Type Definition
 *
 * Complete definition for auto glass shop operations.
 * Essential for windshield repair, glass replacement, and mobile services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_GLASS_APP_TYPE: AppTypeDefinition = {
  id: 'auto-glass',
  name: 'Auto Glass',
  category: 'automotive',
  description: 'Auto glass platform with appointment scheduling, insurance processing, mobile service dispatch, and inventory management',
  icon: 'square',

  keywords: [
    'auto glass',
    'windshield repair',
    'auto glass software',
    'glass replacement',
    'mobile auto glass',
    'auto glass management',
    'appointment scheduling',
    'auto glass practice',
    'auto glass scheduling',
    'insurance processing',
    'auto glass crm',
    'mobile dispatch',
    'auto glass business',
    'inventory management',
    'auto glass pos',
    'chip repair',
    'auto glass operations',
    'calibration services',
    'auto glass platform',
    'sunroof repair',
  ],

  synonyms: [
    'auto glass platform',
    'auto glass software',
    'windshield repair software',
    'glass replacement software',
    'mobile auto glass software',
    'appointment scheduling software',
    'auto glass practice software',
    'insurance processing software',
    'mobile dispatch software',
    'calibration services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and claims' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Services and dispatch' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/appointments' },
    { id: 'technician', name: 'Glass Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'recalls-tracking',
    'clients',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an auto glass platform',
    'Create a windshield repair portal',
    'I need an auto glass shop management system',
    'Build a mobile dispatch platform',
    'Create an insurance processing and scheduling app',
  ],
};
