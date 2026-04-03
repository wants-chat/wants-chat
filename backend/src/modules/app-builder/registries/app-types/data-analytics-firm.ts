/**
 * Data Analytics Firm App Type Definition
 *
 * Complete definition for data analytics and business intelligence operations.
 * Essential for analytics firms, data science consultancies, and BI providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DATA_ANALYTICS_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'data-analytics-firm',
  name: 'Data Analytics Firm',
  category: 'professional-services',
  description: 'Data analytics platform with project management, dashboard builder, data pipelines, and client reporting',
  icon: 'chart-bar',

  keywords: [
    'data analytics firm',
    'data analytics',
    'data analytics firm software',
    'data science',
    'business intelligence',
    'data analytics firm management',
    'project management',
    'data analytics firm practice',
    'data analytics firm scheduling',
    'dashboard builder',
    'data analytics firm crm',
    'data pipelines',
    'data analytics firm business',
    'client reporting',
    'data analytics firm pos',
    'machine learning',
    'data analytics firm operations',
    'predictive analytics',
    'data analytics firm platform',
    'data visualization',
  ],

  synonyms: [
    'data analytics firm platform',
    'data analytics firm software',
    'data analytics software',
    'data science software',
    'business intelligence software',
    'project management software',
    'data analytics firm practice software',
    'dashboard builder software',
    'data pipelines software',
    'data visualization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Dashboards and reports' },
    { id: 'admin', name: 'Analytics Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and data' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'analyst', name: 'Lead Analyst', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'data-engineer', name: 'Data Engineer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pipelines' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
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
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a data analytics firm platform',
    'Create a BI consulting portal',
    'I need a data analytics management system',
    'Build a dashboard and reporting platform',
    'Create a data pipeline management app',
  ],
};
