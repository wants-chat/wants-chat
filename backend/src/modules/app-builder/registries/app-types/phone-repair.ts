/**
 * Phone Repair App Type Definition
 *
 * Complete definition for phone and device repair operations.
 * Essential for phone repair shops, device repair centers, and electronics repair.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHONE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'phone-repair',
  name: 'Phone Repair',
  category: 'services',
  description: 'Phone repair platform with repair tracking, parts inventory, diagnostic tools, and warranty management',
  icon: 'smartphone',

  keywords: [
    'phone repair',
    'device repair',
    'phone repair software',
    'electronics repair',
    'screen repair',
    'phone repair management',
    'repair tracking',
    'phone repair practice',
    'phone repair scheduling',
    'parts inventory',
    'phone repair crm',
    'diagnostic tools',
    'phone repair business',
    'warranty management',
    'phone repair pos',
    'battery replacement',
    'phone repair operations',
    'tablet repair',
    'phone repair platform',
    'data recovery',
  ],

  synonyms: [
    'phone repair platform',
    'phone repair software',
    'device repair software',
    'electronics repair software',
    'screen repair software',
    'repair tracking software',
    'phone repair practice software',
    'parts inventory software',
    'diagnostic tools software',
    'battery replacement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Repairs and status' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Repairs and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'technician', name: 'Lead Technician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/repairs' },
    { id: 'staff', name: 'Tech Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a phone repair platform',
    'Create a device repair portal',
    'I need a phone repair management system',
    'Build a repair tracking platform',
    'Create a parts inventory app',
  ],
};
