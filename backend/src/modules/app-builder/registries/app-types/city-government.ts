/**
 * City Government App Type Definition
 *
 * Complete definition for city government and municipal portal applications.
 * Essential for city governments, municipalities, and local government services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CITY_GOVERNMENT_APP_TYPE: AppTypeDefinition = {
  id: 'city-government',
  name: 'City Government',
  category: 'government',
  description: 'City government portal with citizen services, permit applications, public meetings, and city information',
  icon: 'landmark',

  keywords: [
    'city government',
    'municipal portal',
    'city hall',
    'city services',
    'municipal services',
    'city website',
    'local government',
    'city portal',
    'citizen services',
    'government portal',
    'municipal government',
    'city administration',
    'public services',
    'city council',
    'city departments',
    'city news',
    'city events',
    'city meetings',
    'city records',
    'civic portal',
  ],

  synonyms: [
    'city government platform',
    'city government software',
    'municipal portal software',
    'city services platform',
    'local government software',
    'city website platform',
    'municipal government software',
    'citizen services platform',
    'city hall software',
    'civic engagement platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'federal government'],

  sections: [
    { id: 'frontend', name: 'Citizen Portal', enabled: true, basePath: '/', layout: 'public', description: 'City services and information' },
    { id: 'admin', name: 'Staff Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Service management' },
  ],

  roles: [
    { id: 'admin', name: 'City Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Department Head', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/department' },
    { id: 'staff', name: 'City Staff', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'council', name: 'Council Member', level: 40, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/meetings' },
    { id: 'citizen', name: 'Citizen', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a city government portal',
    'Create a municipal services platform',
    'I need a city hall website',
    'Build a citizen services portal',
    'Create a local government app',
  ],
};
