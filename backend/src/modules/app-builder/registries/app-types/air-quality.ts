/**
 * Air Quality App Type Definition
 *
 * Complete definition for air quality monitoring and services.
 * Essential for air quality consultants, monitoring companies, and environmental agencies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_QUALITY_APP_TYPE: AppTypeDefinition = {
  id: 'air-quality',
  name: 'Air Quality Services',
  category: 'environmental',
  description: 'Air quality platform with monitoring networks, emissions tracking, permit management, and compliance reporting',
  icon: 'wind',

  keywords: [
    'air quality',
    'emissions monitoring',
    'air quality software',
    'air pollution',
    'aqi monitoring',
    'air quality management',
    'monitoring networks',
    'air quality practice',
    'air quality scheduling',
    'emissions tracking',
    'air quality crm',
    'cems systems',
    'air quality business',
    'stack testing',
    'air quality pos',
    'indoor air quality',
    'air quality operations',
    'title v permits',
    'air quality services',
    'fugitive emissions',
  ],

  synonyms: [
    'air quality platform',
    'air quality software',
    'emissions monitoring software',
    'air pollution software',
    'aqi monitoring software',
    'monitoring networks software',
    'air quality practice software',
    'emissions tracking software',
    'cems systems software',
    'indoor air quality software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Air quality data' },
    { id: 'admin', name: 'Monitoring Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Stations and emissions' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'analyst', name: 'Air Quality Analyst', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/monitoring' },
    { id: 'technician', name: 'Field Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/stations' },
    { id: 'public', name: 'Public User', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an air quality monitoring platform',
    'Create an emissions tracking portal',
    'I need an air quality management system',
    'Build an AQI monitoring platform',
    'Create an air quality compliance and reporting app',
  ],
};
