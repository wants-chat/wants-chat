/**
 * Disaster Restoration App Type Definition
 *
 * Complete definition for disaster restoration operations.
 * Essential for restoration contractors, water damage specialists, and fire restoration companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DISASTER_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'disaster-restoration',
  name: 'Disaster Restoration',
  category: 'services',
  description: 'Disaster restoration platform with emergency dispatch, insurance documentation, project tracking, and mitigation monitoring',
  icon: 'home',

  keywords: [
    'disaster restoration',
    'water damage',
    'disaster restoration software',
    'fire restoration',
    'storm damage',
    'disaster restoration management',
    'emergency dispatch',
    'disaster restoration practice',
    'disaster restoration scheduling',
    'insurance documentation',
    'disaster restoration crm',
    'project tracking',
    'disaster restoration business',
    'mitigation monitoring',
    'disaster restoration pos',
    'flood damage',
    'disaster restoration operations',
    'smoke damage',
    'disaster restoration platform',
    'content cleaning',
  ],

  synonyms: [
    'disaster restoration platform',
    'disaster restoration software',
    'water damage software',
    'fire restoration software',
    'storm damage software',
    'emergency dispatch software',
    'disaster restoration practice software',
    'insurance documentation software',
    'project tracking software',
    'flood damage software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and claims' },
    { id: 'admin', name: 'Restoration Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Dispatch and tracking' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Restoration Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Property Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a disaster restoration platform',
    'Create a water damage restoration app',
    'I need a fire restoration system',
    'Build a storm damage company app',
    'Create a restoration contractor portal',
  ],
};
