/**
 * IT Support App Type Definition
 *
 * Complete definition for IT support companies and tech help desks.
 * Essential for IT service providers, tech support companies, and help desk operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IT_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'it-support',
  name: 'IT Support',
  category: 'technology',
  description: 'IT support platform with ticket management, remote support, asset tracking, and SLA monitoring',
  icon: 'headphones',

  keywords: [
    'it support',
    'tech help desk',
    'it support software',
    'computer repair',
    'help desk',
    'it support management',
    'ticket management',
    'it support practice',
    'it support scheduling',
    'remote support',
    'it support crm',
    'troubleshooting',
    'it support business',
    'asset tracking',
    'it support pos',
    'tech support',
    'it support operations',
    'sla monitoring',
    'it support services',
    'managed it',
  ],

  synonyms: [
    'it support platform',
    'it support software',
    'tech help desk software',
    'computer repair software',
    'help desk software',
    'ticket management software',
    'it support practice software',
    'remote support software',
    'troubleshooting software',
    'managed it software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and support' },
    { id: 'admin', name: 'Support Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Technicians and tickets' },
  ],

  roles: [
    { id: 'admin', name: 'IT Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'technician', name: 'Senior Technician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tickets' },
    { id: 'support', name: 'Support Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
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
    'contracts',
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an IT support platform',
    'Create a tech help desk portal',
    'I need an IT service management system',
    'Build a computer repair ticket platform',
    'Create a help desk and asset tracking app',
  ],
};
