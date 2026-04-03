/**
 * HR Consulting App Type Definition
 *
 * Complete definition for HR consulting and human capital advisory firms.
 * Essential for talent management, organizational development, and workforce optimization.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HR_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'hr-consulting',
  name: 'HR Consulting',
  category: 'professional-services',
  description: 'HR consulting platform with talent assessment, organizational design, compensation analysis, and workforce planning tools',
  icon: 'users',

  keywords: [
    'HR consulting',
    'human resources consulting',
    'HR consulting software',
    'talent management',
    'organizational development',
    'HR consulting management',
    'workforce planning',
    'HR consulting practice',
    'HR consulting scheduling',
    'compensation consulting',
    'HR consulting crm',
    'employee engagement',
    'HR consulting business',
    'leadership development',
    'HR consulting pos',
    'performance management',
    'HR consulting operations',
    'culture transformation',
    'HR consulting services',
    'people consulting',
  ],

  synonyms: [
    'HR consulting platform',
    'HR consulting software',
    'human resources consulting software',
    'talent management software',
    'organizational development software',
    'workforce planning software',
    'HR consulting practice software',
    'compensation consulting software',
    'leadership development software',
    'people consulting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and assessments' },
    { id: 'admin', name: 'HR Consulting Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and engagements' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Consultant', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'senior', name: 'Senior Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'consultant', name: 'HR Consultant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
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

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build an HR consulting platform',
    'Create a human resources advisory portal',
    'I need a talent management consulting system',
    'Build an HR consulting practice platform',
    'Create an organizational development app',
  ],
};
