/**
 * Solar Installer App Type Definition
 *
 * Complete definition for solar installation company applications.
 * Essential for solar installers, renewable energy contractors, and solar sales.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'solar-installer',
  name: 'Solar Installer',
  category: 'energy',
  description: 'Solar installation platform with lead management, proposal generation, project tracking, and monitoring integration',
  icon: 'sun',

  keywords: [
    'solar installer',
    'solar installation',
    'solar company',
    'solar software',
    'solar panel',
    'solar energy',
    'solar contractor',
    'solar sales',
    'solar crm',
    'solar proposals',
    'solar design',
    'solar project',
    'residential solar',
    'commercial solar',
    'solar business',
    'solar leads',
    'solar scheduling',
    'pv installation',
    'solar monitoring',
    'renewable energy',
  ],

  synonyms: [
    'solar installer platform',
    'solar installer software',
    'solar installation software',
    'solar company software',
    'solar crm software',
    'solar sales software',
    'solar project software',
    'solar proposal software',
    'solar contractor software',
    'pv installation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'solar system astronomy'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and monitoring' },
    { id: 'admin', name: 'Solar Dashboard', enabled: true, basePath: '/admin', requiredRole: 'installer', layout: 'admin', description: 'Projects and leads' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/leads' },
    { id: 'designer', name: 'System Designer', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/designs' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a solar installation platform',
    'Create a solar company CRM',
    'I need a solar project management system',
    'Build a solar proposal generator',
    'Create a solar installer app',
  ],
};
