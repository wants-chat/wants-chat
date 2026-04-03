/**
 * Green Building Consultant App Type Definition
 *
 * Complete definition for green building consulting operations.
 * Essential for LEED consultants, sustainable design firms, and energy efficiency advisors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GREEN_BUILDING_CONSULTANT_APP_TYPE: AppTypeDefinition = {
  id: 'green-building-consultant',
  name: 'Green Building Consultant',
  category: 'professional-services',
  description: 'Green building platform with certification tracking, energy modeling, documentation management, and compliance verification',
  icon: 'building',

  keywords: [
    'green building consultant',
    'leed consultant',
    'green building consultant software',
    'sustainable design',
    'energy efficiency',
    'green building consultant management',
    'certification tracking',
    'green building consultant practice',
    'green building consultant scheduling',
    'energy modeling',
    'green building consultant crm',
    'documentation management',
    'green building consultant business',
    'compliance verification',
    'green building consultant pos',
    'net zero energy',
    'green building consultant operations',
    'passive house',
    'green building consultant platform',
    'living building',
  ],

  synonyms: [
    'green building consultant platform',
    'green building consultant software',
    'leed consultant software',
    'sustainable design software',
    'energy efficiency software',
    'certification tracking software',
    'green building consultant practice software',
    'energy modeling software',
    'documentation management software',
    'net zero energy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and certifications' },
    { id: 'admin', name: 'Consultant Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and documentation' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Consultant', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'consultant', name: 'LEED AP', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'analyst', name: 'Energy Analyst', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/modeling' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a green building consultant platform',
    'Create a LEED consulting app',
    'I need a sustainable design firm system',
    'Build an energy efficiency advisor app',
    'Create a green building consultant portal',
  ],
};
