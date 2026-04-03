/**
 * Home Theater Installer App Type Definition
 *
 * Complete definition for home theater installation operations.
 * Essential for home theater installers, audio visual specialists, and smart home integrators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_THEATER_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'home-theater-installer',
  name: 'Home Theater Installer',
  category: 'services',
  description: 'Home theater installer platform with project consultation, equipment configuration, installation scheduling, and system calibration',
  icon: 'tv',

  keywords: [
    'home theater installer',
    'audio visual',
    'home theater installer software',
    'smart home',
    'av installation',
    'home theater installer management',
    'project consultation',
    'home theater installer practice',
    'home theater installer scheduling',
    'equipment configuration',
    'home theater installer crm',
    'installation scheduling',
    'home theater installer business',
    'system calibration',
    'home theater installer pos',
    'surround sound',
    'home theater installer operations',
    'projector installation',
    'home theater installer platform',
    'whole house audio',
  ],

  synonyms: [
    'home theater installer platform',
    'home theater installer software',
    'audio visual software',
    'smart home software',
    'av installation software',
    'project consultation software',
    'home theater installer practice software',
    'equipment configuration software',
    'installation scheduling software',
    'surround sound software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Designs and quotes' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and service' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'System Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/consultations' },
    { id: 'technician', name: 'AV Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build a home theater installer platform',
    'Create an AV installation app',
    'I need a smart home integration system',
    'Build a home theater business app',
    'Create an audio visual installer portal',
  ],
};
