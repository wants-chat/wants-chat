/**
 * Insulation Contractor App Type Definition
 *
 * Complete definition for insulation installation operations.
 * Essential for insulation contractors, energy efficiency specialists, and weatherization companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSULATION_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'insulation-contractor',
  name: 'Insulation Contractor',
  category: 'construction',
  description: 'Insulation contractor platform with energy assessments, material calculations, crew scheduling, and rebate tracking',
  icon: 'thermometer',

  keywords: [
    'insulation contractor',
    'energy efficiency',
    'insulation contractor software',
    'weatherization',
    'spray foam',
    'insulation contractor management',
    'energy assessments',
    'insulation contractor practice',
    'insulation contractor scheduling',
    'material calculations',
    'insulation contractor crm',
    'crew scheduling',
    'insulation contractor business',
    'rebate tracking',
    'insulation contractor pos',
    'blown in',
    'insulation contractor operations',
    'attic insulation',
    'insulation contractor platform',
    'crawl space',
  ],

  synonyms: [
    'insulation contractor platform',
    'insulation contractor software',
    'energy efficiency software',
    'weatherization software',
    'spray foam software',
    'energy assessments software',
    'insulation contractor practice software',
    'material calculations software',
    'crew scheduling software',
    'blown in software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Assessments and quotes' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'eco',

  examplePrompts: [
    'Build an insulation contractor platform',
    'Create an energy efficiency company app',
    'I need a spray foam business system',
    'Build a weatherization contractor app',
    'Create an insulation company portal',
  ],
};
