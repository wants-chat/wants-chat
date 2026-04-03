/**
 * Security System Installer App Type Definition
 *
 * Complete definition for security system installation operations.
 * Essential for security system installers, alarm companies, and surveillance specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_SYSTEM_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'security-system-installer',
  name: 'Security System Installer',
  category: 'services',
  description: 'Security system installer platform with site assessments, equipment configuration, installation scheduling, and monitoring activation',
  icon: 'shield',

  keywords: [
    'security system installer',
    'alarm company',
    'security system installer software',
    'surveillance',
    'access control',
    'security system installer management',
    'site assessments',
    'security system installer practice',
    'security system installer scheduling',
    'equipment configuration',
    'security system installer crm',
    'installation scheduling',
    'security system installer business',
    'monitoring activation',
    'security system installer pos',
    'cctv',
    'security system installer operations',
    'smart locks',
    'security system installer platform',
    'video doorbell',
  ],

  synonyms: [
    'security system installer platform',
    'security system installer software',
    'alarm company software',
    'surveillance software',
    'access control software',
    'site assessments software',
    'security system installer practice software',
    'equipment configuration software',
    'installation scheduling software',
    'cctv software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Systems and monitoring' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Installs and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Security Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/assessments' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'secure',

  examplePrompts: [
    'Build a security system installer platform',
    'Create an alarm company management app',
    'I need a surveillance installation system',
    'Build a security business app',
    'Create a security installer portal',
  ],
};
