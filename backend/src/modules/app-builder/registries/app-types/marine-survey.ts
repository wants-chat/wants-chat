/**
 * Marine Survey App Type Definition
 *
 * Complete definition for marine surveyors and vessel inspections.
 * Essential for boat surveys, yacht valuations, and maritime inspections.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARINE_SURVEY_APP_TYPE: AppTypeDefinition = {
  id: 'marine-survey',
  name: 'Marine Survey',
  category: 'marine',
  description: 'Marine survey platform with inspection scheduling, report generation, photo documentation, and client management',
  icon: 'clipboard-check',

  keywords: [
    'marine survey',
    'boat survey',
    'marine survey software',
    'vessel inspection',
    'marine surveyor',
    'marine survey management',
    'yacht survey',
    'pre-purchase survey',
    'marine survey scheduling',
    'condition survey',
    'marine survey crm',
    'damage survey',
    'marine survey business',
    'insurance survey',
    'marine survey pos',
    'valuation survey',
    'marine survey operations',
    'hull inspection',
    'marine survey services',
    'SAMS surveyor',
  ],

  synonyms: [
    'marine survey platform',
    'marine survey software',
    'boat survey software',
    'vessel inspection software',
    'marine surveyor software',
    'yacht survey software',
    'pre-purchase survey software',
    'condition survey software',
    'damage survey software',
    'SAMS surveyor software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'land survey'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Surveys and reports' },
    { id: 'admin', name: 'Surveyor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'surveyor', layout: 'admin', description: 'Inspections and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Surveyor', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'surveyor', name: 'Marine Surveyor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/surveys' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'gallery',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a marine survey platform',
    'Create a boat inspection app',
    'I need a marine surveyor scheduling system',
    'Build a yacht valuation platform',
    'Create a vessel inspection report app',
  ],
};
