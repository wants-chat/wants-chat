/**
 * Web Hosting App Type Definition
 *
 * Complete definition for web hosting provider operations.
 * Essential for hosting companies, domain registrars, and server providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEB_HOSTING_APP_TYPE: AppTypeDefinition = {
  id: 'web-hosting',
  name: 'Web Hosting',
  category: 'technology',
  description: 'Web hosting platform with server management, domain registration, billing automation, and support ticketing',
  icon: 'server',

  keywords: [
    'web hosting',
    'hosting provider',
    'web hosting software',
    'domain registrar',
    'server provider',
    'web hosting management',
    'server management',
    'web hosting practice',
    'web hosting scheduling',
    'domain registration',
    'web hosting crm',
    'billing automation',
    'web hosting business',
    'support ticketing',
    'web hosting pos',
    'shared hosting',
    'web hosting operations',
    'vps hosting',
    'web hosting platform',
    'dedicated servers',
  ],

  synonyms: [
    'web hosting platform',
    'web hosting software',
    'hosting provider software',
    'domain registrar software',
    'server provider software',
    'server management software',
    'web hosting practice software',
    'domain registration software',
    'billing automation software',
    'vps hosting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Hosting and domains' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Servers and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'support', name: 'Support Lead', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tickets' },
    { id: 'technician', name: 'System Admin', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/servers' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a web hosting platform',
    'Create a hosting provider portal',
    'I need a web hosting management system',
    'Build a server and domain platform',
    'Create a billing and support app',
  ],
};
