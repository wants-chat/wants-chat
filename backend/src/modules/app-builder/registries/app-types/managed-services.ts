/**
 * Managed Services App Type Definition
 *
 * Complete definition for managed service providers (MSPs).
 * Essential for MSPs, IT outsourcing companies, and remote IT management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MANAGED_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'managed-services',
  name: 'Managed Services Provider',
  category: 'technology',
  description: 'MSP platform with client onboarding, remote monitoring, patch management, and service level agreements',
  icon: 'settings',

  keywords: [
    'managed services',
    'msp software',
    'managed services software',
    'it outsourcing',
    'remote monitoring',
    'managed services management',
    'client onboarding',
    'managed services practice',
    'managed services scheduling',
    'patch management',
    'managed services crm',
    'rmm tools',
    'managed services business',
    'endpoint management',
    'managed services pos',
    'backup management',
    'managed services operations',
    'security services',
    'managed services platform',
    'proactive it',
  ],

  synonyms: [
    'managed services platform',
    'managed services software',
    'msp software platform',
    'it outsourcing software',
    'remote monitoring software',
    'client onboarding software',
    'managed services practice software',
    'patch management software',
    'rmm tools software',
    'proactive it software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and reports' },
    { id: 'admin', name: 'MSP Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and endpoints' },
  ],

  roles: [
    { id: 'admin', name: 'MSP Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Senior Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/monitoring' },
    { id: 'technician', name: 'NOC Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/alerts' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a managed services provider platform',
    'Create an MSP portal',
    'I need an IT outsourcing management system',
    'Build a remote monitoring platform',
    'Create an MSP client and endpoint management app',
  ],
};
