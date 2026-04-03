/**
 * Generator Installer App Type Definition
 *
 * Complete definition for generator installation and service operations.
 * Essential for generator installers, backup power specialists, and standby generator companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GENERATOR_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'generator-installer',
  name: 'Generator Installer',
  category: 'services',
  description: 'Generator installer platform with site assessments, load calculations, installation scheduling, and maintenance contracts',
  icon: 'zap',

  keywords: [
    'generator installer',
    'backup power',
    'generator installer software',
    'standby generator',
    'whole house generator',
    'generator installer management',
    'site assessments',
    'generator installer practice',
    'generator installer scheduling',
    'load calculations',
    'generator installer crm',
    'installation scheduling',
    'generator installer business',
    'maintenance contracts',
    'generator installer pos',
    'portable generator',
    'generator installer operations',
    'transfer switch',
    'generator installer platform',
    'fuel delivery',
  ],

  synonyms: [
    'generator installer platform',
    'generator installer software',
    'backup power software',
    'standby generator software',
    'whole house generator software',
    'site assessments software',
    'generator installer practice software',
    'load calculations software',
    'installation scheduling software',
    'portable generator software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Systems and service' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Installs and maintenance' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Power Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/assessments' },
    { id: 'technician', name: 'Install Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'power',

  examplePrompts: [
    'Build a generator installer platform',
    'Create a backup power company app',
    'I need a standby generator installation system',
    'Build a generator service business app',
    'Create a generator installer portal',
  ],
};
