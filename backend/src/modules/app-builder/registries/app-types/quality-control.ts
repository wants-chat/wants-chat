/**
 * Quality Control App Type Definition
 *
 * Complete definition for quality control and quality management applications.
 * Essential for QC departments, quality assurance, and compliance tracking.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUALITY_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'quality-control',
  name: 'Quality Control',
  category: 'manufacturing',
  description: 'Quality control platform with inspection management, non-conformance tracking, SPC, and audit management',
  icon: 'check-circle',

  keywords: [
    'quality control',
    'quality management',
    'qc software',
    'qms',
    'quality assurance',
    'inspection management',
    'non-conformance',
    'ncr tracking',
    'spc',
    'statistical process control',
    'quality audits',
    'iso compliance',
    'quality metrics',
    'defect tracking',
    'quality testing',
    'quality reports',
    'capa',
    'corrective action',
    'quality inspection',
    'quality standards',
  ],

  synonyms: [
    'quality control platform',
    'quality control software',
    'quality management software',
    'qms software',
    'inspection management software',
    'quality assurance software',
    'non-conformance software',
    'spc software',
    'quality audit software',
    'defect tracking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'quality of life'],

  sections: [
    { id: 'frontend', name: 'QC Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quality status and reports' },
    { id: 'admin', name: 'Quality Dashboard', enabled: true, basePath: '/admin', requiredRole: 'inspector', layout: 'admin', description: 'Inspections and NCRs' },
  ],

  roles: [
    { id: 'admin', name: 'Quality Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Quality Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/metrics' },
    { id: 'engineer', name: 'Quality Engineer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/ncrs' },
    { id: 'inspector', name: 'Inspector', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'auditor', name: 'Auditor', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/audits' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a quality control system',
    'Create a QMS platform',
    'I need an inspection management app',
    'Build a non-conformance tracking system',
    'Create a quality audit platform',
  ],
};
