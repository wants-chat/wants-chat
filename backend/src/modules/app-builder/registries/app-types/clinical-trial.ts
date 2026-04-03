/**
 * Clinical Trial App Type Definition
 *
 * Complete definition for clinical trial management operations.
 * Essential for clinical research organizations, pharmaceutical companies, and trial sites.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLINICAL_TRIAL_APP_TYPE: AppTypeDefinition = {
  id: 'clinical-trial',
  name: 'Clinical Trial',
  category: 'healthcare',
  description: 'Clinical trial platform with participant recruitment, protocol management, data collection, and regulatory compliance',
  icon: 'clipboard-list',

  keywords: [
    'clinical trial',
    'clinical research',
    'clinical trial software',
    'pharmaceutical research',
    'trial site',
    'clinical trial management',
    'participant recruitment',
    'clinical trial practice',
    'clinical trial scheduling',
    'protocol management',
    'clinical trial crm',
    'data collection',
    'clinical trial business',
    'regulatory compliance',
    'clinical trial pos',
    'patient screening',
    'clinical trial operations',
    'adverse events',
    'clinical trial platform',
    'irb compliance',
  ],

  synonyms: [
    'clinical trial platform',
    'clinical trial software',
    'clinical research software',
    'pharmaceutical research software',
    'trial site software',
    'participant recruitment software',
    'clinical trial practice software',
    'protocol management software',
    'data collection software',
    'regulatory compliance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Participant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Studies and consent' },
    { id: 'admin', name: 'Trial Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Participants and data' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Investigator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Study Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/participants' },
    { id: 'staff', name: 'Research Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/data' },
    { id: 'participant', name: 'Participant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a clinical trial platform',
    'Create a clinical research portal',
    'I need a trial management system',
    'Build a participant recruitment platform',
    'Create a protocol and data collection app',
  ],
};
