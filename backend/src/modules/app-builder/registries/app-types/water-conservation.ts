/**
 * Water Conservation App Type Definition
 *
 * Complete definition for water conservation service operations.
 * Essential for water efficiency consultants, irrigation auditors, and conservation programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_CONSERVATION_APP_TYPE: AppTypeDefinition = {
  id: 'water-conservation',
  name: 'Water Conservation',
  category: 'environmental',
  description: 'Water conservation platform with usage audits, retrofit management, rebate tracking, and savings verification',
  icon: 'droplet',

  keywords: [
    'water conservation',
    'water efficiency',
    'water conservation software',
    'irrigation audit',
    'conservation program',
    'water conservation management',
    'usage audits',
    'water conservation practice',
    'water conservation scheduling',
    'retrofit management',
    'water conservation crm',
    'rebate tracking',
    'water conservation business',
    'savings verification',
    'water conservation pos',
    'xeriscaping',
    'water conservation operations',
    'rainwater harvesting',
    'water conservation platform',
    'greywater systems',
  ],

  synonyms: [
    'water conservation platform',
    'water conservation software',
    'water efficiency software',
    'irrigation audit software',
    'conservation program software',
    'usage audits software',
    'water conservation practice software',
    'retrofit management software',
    'rebate tracking software',
    'xeriscaping software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Audits and savings' },
    { id: 'admin', name: 'Conservation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'auditor', name: 'Water Auditor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/audits' },
    { id: 'technician', name: 'Installation Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/retrofits' },
    { id: 'customer', name: 'Property Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'eco',

  examplePrompts: [
    'Build a water conservation platform',
    'Create a water efficiency consulting app',
    'I need an irrigation audit system',
    'Build a conservation program app',
    'Create a water conservation portal',
  ],
};
