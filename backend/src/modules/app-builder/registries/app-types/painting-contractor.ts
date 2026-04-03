/**
 * Painting Contractor App Type Definition
 *
 * Complete definition for painting contractor operations.
 * Essential for painting contractors, residential painters, and commercial coating specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAINTING_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'painting-contractor',
  name: 'Painting Contractor',
  category: 'services',
  description: 'Painting contractor platform with project estimation, crew scheduling, color consultation, and warranty management',
  icon: 'paint-bucket',

  keywords: [
    'painting contractor',
    'residential painter',
    'painting contractor software',
    'commercial painting',
    'interior exterior',
    'painting contractor management',
    'project estimation',
    'painting contractor practice',
    'painting contractor scheduling',
    'crew scheduling',
    'painting contractor crm',
    'color consultation',
    'painting contractor business',
    'warranty management',
    'painting contractor pos',
    'cabinet painting',
    'painting contractor operations',
    'deck staining',
    'painting contractor platform',
    'wallpaper',
  ],

  synonyms: [
    'painting contractor platform',
    'painting contractor software',
    'residential painter software',
    'commercial painting software',
    'interior exterior software',
    'project estimation software',
    'painting contractor practice software',
    'crew scheduling software',
    'color consultation software',
    'cabinet painting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'foreman', name: 'Crew Foreman', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'painter', name: 'Painter', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'clients',
    'gallery',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a painting contractor platform',
    'Create a residential painting app',
    'I need a commercial painting system',
    'Build a painting business management app',
    'Create a painting company portal',
  ],
};
