/**
 * Video Production App Type Definition
 *
 * Complete definition for video production company operations.
 * Essential for video production houses, commercial filmmakers, and content creators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'video-production',
  name: 'Video Production',
  category: 'entertainment',
  description: 'Video production platform with project management, crew scheduling, equipment tracking, and client deliverables',
  icon: 'video',

  keywords: [
    'video production',
    'film production',
    'video production software',
    'commercial filmmaker',
    'content creator',
    'video production management',
    'project management',
    'video production practice',
    'video production scheduling',
    'crew scheduling',
    'video production crm',
    'equipment tracking',
    'video production business',
    'client deliverables',
    'video production pos',
    'post production',
    'video production operations',
    'editing workflow',
    'video production platform',
    'color grading',
  ],

  synonyms: [
    'video production platform',
    'video production software',
    'film production software',
    'commercial filmmaker software',
    'content creator software',
    'project management software',
    'video production practice software',
    'crew scheduling software',
    'equipment tracking software',
    'post production software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and deliverables' },
    { id: 'admin', name: 'Production Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crew' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Producer', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'producer', name: 'Producer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'coordinator', name: 'Production Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a video production platform',
    'Create a film production portal',
    'I need a production management system',
    'Build a crew and project platform',
    'Create a video deliverable tracking app',
  ],
};
