/**
 * Forensic Lab App Type Definition
 *
 * Complete definition for forensic laboratory operations.
 * Essential for forensic labs, crime labs, and DNA testing facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FORENSIC_LAB_APP_TYPE: AppTypeDefinition = {
  id: 'forensic-lab',
  name: 'Forensic Lab',
  category: 'science-research',
  description: 'Forensic lab platform with evidence tracking, chain of custody, case management, and report generation',
  icon: 'fingerprint',

  keywords: [
    'forensic lab',
    'forensic laboratory',
    'forensic lab software',
    'crime lab',
    'dna testing',
    'forensic lab management',
    'evidence tracking',
    'forensic lab practice',
    'forensic lab scheduling',
    'chain of custody',
    'forensic lab crm',
    'case management',
    'forensic lab business',
    'report generation',
    'forensic lab pos',
    'toxicology',
    'forensic lab operations',
    'ballistics',
    'forensic lab platform',
    'digital forensics',
  ],

  synonyms: [
    'forensic lab platform',
    'forensic lab software',
    'forensic laboratory software',
    'crime lab software',
    'dna testing software',
    'evidence tracking software',
    'forensic lab practice software',
    'chain of custody software',
    'case management software',
    'toxicology software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Agency Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and results' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Evidence and analysis' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'examiner', name: 'Forensic Examiner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/evidence' },
    { id: 'agency', name: 'Submitting Agency', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'science-research',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a forensic lab platform',
    'Create a crime lab portal',
    'I need a forensic evidence tracking system',
    'Build a chain of custody platform',
    'Create a case and report management app',
  ],
};
