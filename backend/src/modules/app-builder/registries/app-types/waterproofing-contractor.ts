/**
 * Waterproofing Contractor App Type Definition
 *
 * Complete definition for waterproofing and basement operations.
 * Essential for waterproofing contractors, basement specialists, and foundation repair companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERPROOFING_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'waterproofing-contractor',
  name: 'Waterproofing Contractor',
  category: 'construction',
  description: 'Waterproofing contractor platform with inspection scheduling, project estimation, warranty management, and moisture tracking',
  icon: 'droplet',

  keywords: [
    'waterproofing contractor',
    'basement specialist',
    'waterproofing contractor software',
    'foundation repair',
    'moisture control',
    'waterproofing contractor management',
    'inspection scheduling',
    'waterproofing contractor practice',
    'waterproofing contractor scheduling',
    'project estimation',
    'waterproofing contractor crm',
    'warranty management',
    'waterproofing contractor business',
    'moisture tracking',
    'waterproofing contractor pos',
    'sump pump',
    'waterproofing contractor operations',
    'french drain',
    'waterproofing contractor platform',
    'crawl space encapsulation',
  ],

  synonyms: [
    'waterproofing contractor platform',
    'waterproofing contractor software',
    'basement specialist software',
    'foundation repair software',
    'moisture control software',
    'inspection scheduling software',
    'waterproofing contractor practice software',
    'project estimation software',
    'warranty management software',
    'sump pump software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inspections and quotes' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and warranties' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'inspector', name: 'Inspector', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inspections' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
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
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a waterproofing contractor platform',
    'Create a basement waterproofing app',
    'I need a foundation repair system',
    'Build a moisture control business app',
    'Create a waterproofing company portal',
  ],
};
