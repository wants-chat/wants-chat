/**
 * Biotech Company App Type Definition
 *
 * Complete definition for biotechnology company operations.
 * Essential for biotech startups, life science companies, and biopharmaceuticals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BIOTECH_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'biotech-company',
  name: 'Biotech Company',
  category: 'science-research',
  description: 'Biotech platform with pipeline management, research tracking, IP portfolio, and investor relations',
  icon: 'dna',

  keywords: [
    'biotech company',
    'biotechnology',
    'biotech company software',
    'life science',
    'biopharmaceutical',
    'biotech company management',
    'pipeline management',
    'biotech company practice',
    'biotech company scheduling',
    'research tracking',
    'biotech company crm',
    'ip portfolio',
    'biotech company business',
    'investor relations',
    'biotech company pos',
    'drug development',
    'biotech company operations',
    'gene therapy',
    'biotech company platform',
    'clinical pipeline',
  ],

  synonyms: [
    'biotech company platform',
    'biotech company software',
    'biotechnology software',
    'life science software',
    'biopharmaceutical software',
    'pipeline management software',
    'biotech company practice software',
    'research tracking software',
    'ip portfolio software',
    'drug development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Investor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pipeline and updates' },
    { id: 'admin', name: 'Company Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Research and IP' },
  ],

  roles: [
    { id: 'admin', name: 'CEO', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'scientist', name: 'Chief Scientist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/pipeline' },
    { id: 'researcher', name: 'Researcher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'investor', name: 'Investor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a biotech company platform',
    'Create a life science portal',
    'I need a pipeline management system',
    'Build an investor relations platform',
    'Create a research and IP tracking app',
  ],
};
