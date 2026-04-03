/**
 * Excavation Company App Type Definition
 *
 * Complete definition for excavation and earthwork operations.
 * Essential for excavation contractors, site work specialists, and grading companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXCAVATION_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'excavation-company',
  name: 'Excavation Company',
  category: 'construction',
  description: 'Excavation company platform with project bidding, equipment dispatch, haul tracking, and site documentation',
  icon: 'shovel',

  keywords: [
    'excavation company',
    'site work',
    'excavation company software',
    'grading',
    'earthwork',
    'excavation company management',
    'project bidding',
    'excavation company practice',
    'excavation company scheduling',
    'equipment dispatch',
    'excavation company crm',
    'haul tracking',
    'excavation company business',
    'site documentation',
    'excavation company pos',
    'trenching',
    'excavation company operations',
    'land clearing',
    'excavation company platform',
    'demolition',
  ],

  synonyms: [
    'excavation company platform',
    'excavation company software',
    'site work software',
    'grading software',
    'earthwork software',
    'project bidding software',
    'excavation company practice software',
    'equipment dispatch software',
    'haul tracking software',
    'trenching software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bids and projects' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Equipment and sites' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'superintendent', name: 'Superintendent', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'operator', name: 'Equipment Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'site-safety',
    'equipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'material-takeoffs',
    'change-orders',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build an excavation company platform',
    'Create a site work contractor app',
    'I need an excavation project bidding system',
    'Build a grading company app',
    'Create an earthwork contractor portal',
  ],
};
