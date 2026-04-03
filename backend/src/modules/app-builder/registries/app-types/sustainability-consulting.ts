/**
 * Sustainability Consulting App Type Definition
 *
 * Complete definition for sustainability and ESG consulting firms.
 * Essential for environmental consulting, ESG reporting, and sustainability strategy.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABILITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'sustainability-consulting',
  name: 'Sustainability Consulting',
  category: 'professional-services',
  description: 'Sustainability consulting platform with ESG reporting, carbon tracking, sustainability audits, and impact measurement tools',
  icon: 'leaf',

  keywords: [
    'sustainability consulting',
    'ESG consulting',
    'sustainability consulting software',
    'environmental consulting',
    'carbon footprint',
    'sustainability consulting management',
    'climate strategy',
    'sustainability consulting practice',
    'sustainability consulting scheduling',
    'green business',
    'sustainability consulting crm',
    'circular economy',
    'sustainability consulting business',
    'net zero',
    'sustainability consulting pos',
    'ESG reporting',
    'sustainability consulting operations',
    'impact measurement',
    'sustainability consulting services',
    'sustainable development',
  ],

  synonyms: [
    'sustainability consulting platform',
    'sustainability consulting software',
    'ESG consulting software',
    'environmental consulting software',
    'carbon footprint software',
    'climate strategy software',
    'sustainability consulting practice software',
    'green business software',
    'net zero software',
    'sustainable development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and metrics' },
    { id: 'admin', name: 'Sustainability Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and projects' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Lead Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'consultant', name: 'Sustainability Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
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

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a sustainability consulting platform',
    'Create an ESG advisory client portal',
    'I need a carbon tracking consulting system',
    'Build a sustainability consulting practice platform',
    'Create an environmental impact assessment app',
  ],
};
