/**
 * Vehicle Wrap App Type Definition
 *
 * Complete definition for vehicle wrap and graphics shop operations.
 * Essential for wrap shops, fleet graphics, and vehicle customization.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_WRAP_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-wrap',
  name: 'Vehicle Wrap',
  category: 'automotive',
  description: 'Vehicle wrap platform with quote builder, design proofing, installation scheduling, and project management',
  icon: 'paintbrush',

  keywords: [
    'vehicle wrap',
    'car wrap',
    'vehicle wrap software',
    'fleet graphics',
    'vinyl wrap',
    'vehicle wrap management',
    'quote builder',
    'vehicle wrap practice',
    'vehicle wrap scheduling',
    'design proofing',
    'vehicle wrap crm',
    'installation scheduling',
    'vehicle wrap business',
    'project management',
    'vehicle wrap pos',
    'color change',
    'vehicle wrap operations',
    'commercial graphics',
    'vehicle wrap platform',
    'ppf protection',
  ],

  synonyms: [
    'vehicle wrap platform',
    'vehicle wrap software',
    'car wrap software',
    'fleet graphics software',
    'vinyl wrap software',
    'quote builder software',
    'vehicle wrap practice software',
    'design proofing software',
    'installation scheduling software',
    'commercial graphics software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Graphic Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'appointments',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a vehicle wrap platform',
    'Create a car wrap shop portal',
    'I need a wrap quote system',
    'Build a graphics installation platform',
    'Create a vehicle customization app',
  ],
};
