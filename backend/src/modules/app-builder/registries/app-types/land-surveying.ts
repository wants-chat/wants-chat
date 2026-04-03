/**
 * Land Surveying App Type Definition
 *
 * Complete definition for land surveying service operations.
 * Essential for surveyors, land surveying firms, and boundary specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAND_SURVEYING_APP_TYPE: AppTypeDefinition = {
  id: 'land-surveying',
  name: 'Land Surveying',
  category: 'professional-services',
  description: 'Land surveying platform with project management, field data collection, CAD integration, and client deliverables',
  icon: 'map-pin',

  keywords: [
    'land surveying',
    'surveyor',
    'land surveying software',
    'boundary survey',
    'topographic survey',
    'land surveying management',
    'project management',
    'land surveying practice',
    'land surveying scheduling',
    'field data collection',
    'land surveying crm',
    'cad integration',
    'land surveying business',
    'client deliverables',
    'land surveying pos',
    'construction staking',
    'land surveying operations',
    'alta survey',
    'land surveying platform',
    'gps surveying',
  ],

  synonyms: [
    'land surveying platform',
    'land surveying software',
    'surveyor software',
    'boundary survey software',
    'topographic survey software',
    'project management software',
    'land surveying practice software',
    'field data collection software',
    'cad integration software',
    'construction staking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and deliverables' },
    { id: 'admin', name: 'Survey Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'surveyor', name: 'Licensed Surveyor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Field Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fieldwork' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'invoicing',
    'notifications',
    'search',
    'messaging',
    'documents',
    'property-valuation',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
    'mls-integration',
    'open-houses',
    'property-listings',
  ],

  incompatibleFeatures: ['restaurant-tables', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a land surveying platform',
    'Create a surveyor firm app',
    'I need a boundary survey system',
    'Build a topographic survey app',
    'Create a land surveying portal',
  ],
};
