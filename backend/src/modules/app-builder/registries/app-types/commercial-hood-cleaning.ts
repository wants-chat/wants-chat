/**
 * Commercial Hood Cleaning App Type Definition
 *
 * Complete definition for commercial kitchen exhaust cleaning operations.
 * Essential for hood cleaning companies, grease exhaust specialists, and kitchen fire safety.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_HOOD_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-hood-cleaning',
  name: 'Commercial Hood Cleaning',
  category: 'services',
  description: 'Commercial hood cleaning platform with scheduling management, compliance documentation, before/after photos, and certificate generation',
  icon: 'fan',

  keywords: [
    'commercial hood cleaning',
    'grease exhaust',
    'commercial hood cleaning software',
    'kitchen fire safety',
    'exhaust cleaning',
    'commercial hood cleaning management',
    'scheduling management',
    'commercial hood cleaning practice',
    'commercial hood cleaning scheduling',
    'compliance documentation',
    'commercial hood cleaning crm',
    'before after photos',
    'commercial hood cleaning business',
    'certificate generation',
    'commercial hood cleaning pos',
    'duct cleaning',
    'commercial hood cleaning operations',
    'filter exchange',
    'commercial hood cleaning platform',
    'nfpa 96',
  ],

  synonyms: [
    'commercial hood cleaning platform',
    'commercial hood cleaning software',
    'grease exhaust software',
    'kitchen fire safety software',
    'exhaust cleaning software',
    'scheduling management software',
    'commercial hood cleaning practice software',
    'compliance documentation software',
    'before after photos software',
    'duct cleaning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'residential', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Scheduling and reports' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Cleaning Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Restaurant Manager', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'gallery',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a commercial hood cleaning platform',
    'Create a kitchen exhaust cleaning app',
    'I need a hood cleaning business system',
    'Build a grease exhaust service app',
    'Create a hood cleaning portal',
  ],
};
