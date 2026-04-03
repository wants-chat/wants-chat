/**
 * Mediation Services App Type Definition
 *
 * Complete definition for mediation and dispute resolution operations.
 * Essential for mediators, arbitrators, and conflict resolution professionals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDIATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'mediation-services',
  name: 'Mediation Services',
  category: 'professional-services',
  description: 'Mediation platform with case intake, session scheduling, document exchange, and settlement tracking',
  icon: 'users',

  keywords: [
    'mediation services',
    'mediator',
    'mediation services software',
    'arbitrator',
    'dispute resolution',
    'mediation services management',
    'case intake',
    'mediation services practice',
    'mediation services scheduling',
    'session scheduling',
    'mediation services crm',
    'document exchange',
    'mediation services business',
    'settlement tracking',
    'mediation services pos',
    'family mediation',
    'mediation services operations',
    'commercial mediation',
    'mediation services platform',
    'workplace mediation',
  ],

  synonyms: [
    'mediation services platform',
    'mediation services software',
    'mediator software',
    'arbitrator software',
    'dispute resolution software',
    'case intake software',
    'mediation services practice software',
    'session scheduling software',
    'document exchange software',
    'settlement tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and documents' },
    { id: 'admin', name: 'Mediator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Cases and calendar' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'mediator', name: 'Mediator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'coordinator', name: 'Case Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'party', name: 'Party', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'billing-timekeeping',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'document-assembly',
    'conflict-check',
    'matter-notes',
    'client-portal',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a mediation services platform',
    'Create a dispute resolution portal',
    'I need a mediation case management system',
    'Build a session scheduling platform',
    'Create a settlement tracking app',
  ],
};
