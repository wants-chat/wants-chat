/**
 * Renewable Energy Installer App Type Definition
 *
 * Complete definition for renewable energy installation operations.
 * Essential for solar installers, wind energy contractors, and clean energy companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RENEWABLE_ENERGY_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'renewable-energy-installer',
  name: 'Renewable Energy Installer',
  category: 'construction',
  description: 'Renewable energy platform with project management, site assessments, installation scheduling, and incentive tracking',
  icon: 'sun',

  keywords: [
    'renewable energy installer',
    'solar installer',
    'renewable energy installer software',
    'wind energy',
    'clean energy',
    'renewable energy installer management',
    'project management',
    'renewable energy installer practice',
    'renewable energy installer scheduling',
    'site assessments',
    'renewable energy installer crm',
    'installation scheduling',
    'renewable energy installer business',
    'incentive tracking',
    'renewable energy installer pos',
    'battery storage',
    'renewable energy installer operations',
    'ev chargers',
    'renewable energy installer platform',
    'grid tie',
  ],

  synonyms: [
    'renewable energy installer platform',
    'renewable energy installer software',
    'solar installer software',
    'wind energy software',
    'clean energy software',
    'project management software',
    'renewable energy installer practice software',
    'site assessments software',
    'installation scheduling software',
    'battery storage software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and savings' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Installation Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'appointments',
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
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'eco',

  examplePrompts: [
    'Build a renewable energy installer platform',
    'Create a solar installation company app',
    'I need a clean energy contractor system',
    'Build a wind energy installer app',
    'Create a renewable energy installer portal',
  ],
};
