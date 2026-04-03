/**
 * Awning Installer App Type Definition
 *
 * Complete definition for awning and shade structure operations.
 * Essential for awning companies, shade structure installers, and outdoor living specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AWNING_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'awning-installer',
  name: 'Awning Installer',
  category: 'construction',
  description: 'Awning installer platform with measurement scheduling, product configuration, installation coordination, and maintenance tracking',
  icon: 'umbrella',

  keywords: [
    'awning installer',
    'shade structure',
    'awning installer software',
    'outdoor living',
    'retractable awning',
    'awning installer management',
    'measurement scheduling',
    'awning installer practice',
    'awning installer scheduling',
    'product configuration',
    'awning installer crm',
    'installation coordination',
    'awning installer business',
    'maintenance tracking',
    'awning installer pos',
    'patio cover',
    'awning installer operations',
    'pergola awning',
    'awning installer platform',
    'commercial awning',
  ],

  synonyms: [
    'awning installer platform',
    'awning installer software',
    'shade structure software',
    'outdoor living software',
    'retractable awning software',
    'measurement scheduling software',
    'awning installer practice software',
    'product configuration software',
    'installation coordination software',
    'patio cover software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and quotes' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/quotes' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build an awning installer platform',
    'Create a shade structure company app',
    'I need a retractable awning system',
    'Build an awning business management app',
    'Create an awning company portal',
  ],
};
