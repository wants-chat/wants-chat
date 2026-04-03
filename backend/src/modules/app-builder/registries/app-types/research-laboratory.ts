/**
 * Research Laboratory App Type Definition
 *
 * Complete definition for research laboratory operations.
 * Essential for research labs, scientific institutions, and R&D facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESEARCH_LABORATORY_APP_TYPE: AppTypeDefinition = {
  id: 'research-laboratory',
  name: 'Research Laboratory',
  category: 'science-research',
  description: 'Research laboratory platform with experiment tracking, equipment management, sample inventory, and publication management',
  icon: 'flask',

  keywords: [
    'research laboratory',
    'research lab',
    'research laboratory software',
    'scientific institution',
    'r&d facility',
    'research laboratory management',
    'experiment tracking',
    'research laboratory practice',
    'research laboratory scheduling',
    'equipment management',
    'research laboratory crm',
    'sample inventory',
    'research laboratory business',
    'publication management',
    'research laboratory pos',
    'lab protocols',
    'research laboratory operations',
    'data collection',
    'research laboratory platform',
    'peer review',
  ],

  synonyms: [
    'research laboratory platform',
    'research laboratory software',
    'research lab software',
    'scientific institution software',
    'r&d facility software',
    'experiment tracking software',
    'research laboratory practice software',
    'equipment management software',
    'sample inventory software',
    'publication management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Researcher Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and publications' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Experiments and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'scientist', name: 'Principal Investigator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/experiments' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/samples' },
    { id: 'researcher', name: 'Researcher', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'science-research',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a research laboratory platform',
    'Create a lab management portal',
    'I need a research experiment tracking system',
    'Build an equipment and sample platform',
    'Create a publication management app',
  ],
};
