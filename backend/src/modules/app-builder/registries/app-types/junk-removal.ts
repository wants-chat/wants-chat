/**
 * Junk Removal App Type Definition
 *
 * Complete definition for junk removal and hauling applications.
 * Essential for junk removal companies, hauling services, and cleanout specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JUNK_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'junk-removal',
  name: 'Junk Removal',
  category: 'cleaning',
  description: 'Junk removal platform with online estimates, job scheduling, truck routing, and donation/recycling tracking',
  icon: 'truck',

  keywords: [
    'junk removal',
    'junk hauling',
    'junk removal software',
    'hauling service',
    'junk pickup',
    'junk removal booking',
    'cleanout service',
    'debris removal',
    'junk removal scheduling',
    'estate cleanout',
    'junk removal crm',
    'trash removal',
    'junk removal business',
    'appliance removal',
    'junk removal pos',
    'furniture removal',
    'junk removal management',
    'construction debris',
    'junk removal services',
    'donation pickup',
  ],

  synonyms: [
    'junk removal platform',
    'junk removal software',
    'junk hauling software',
    'hauling service software',
    'junk pickup software',
    'cleanout service software',
    'debris removal software',
    'junk removal scheduling software',
    'junk removal management software',
    'estate cleanout software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'junk food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and estimates' },
    { id: 'admin', name: 'Junk Removal Dashboard', enabled: true, basePath: '/admin', requiredRole: 'crew', layout: 'admin', description: 'Jobs and trucks' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
    'route-optimization',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'clients',
    'reporting',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'cleaning',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a junk removal booking platform',
    'Create a hauling service scheduling app',
    'I need a junk removal business management system',
    'Build an estate cleanout service app',
    'Create a junk pickup estimation platform',
  ],
};
