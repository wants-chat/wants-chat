/**
 * Engineering Firm App Type Definition
 *
 * Complete definition for engineering firm and consulting applications.
 * Essential for engineering consultancies, civil engineering, and MEP firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENGINEERING_FIRM_APP_TYPE: AppTypeDefinition = {
  id: 'engineering-firm',
  name: 'Engineering Firm',
  category: 'professional-services',
  description: 'Engineering firm platform with project tracking, technical document management, client collaboration, and resource planning',
  icon: 'compass',

  keywords: [
    'engineering firm',
    'engineering consultancy',
    'civil engineering',
    'structural engineering',
    'mep engineering',
    'engineering software',
    'engineering projects',
    'engineering management',
    'consulting engineers',
    'engineering practice',
    'pe firm',
    'engineering design',
    'engineering calculations',
    'engineering documents',
    'engineering billing',
    'engineering proposals',
    'technical consulting',
    'engineering services',
    'engineering client',
    'engineering portal',
  ],

  synonyms: [
    'engineering firm platform',
    'engineering firm software',
    'engineering consultancy software',
    'engineering management software',
    'consulting engineer software',
    'civil engineering software',
    'engineering project software',
    'engineering practice software',
    'engineering billing software',
    'engineering client portal',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'software engineering'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Project status and deliverables' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'engineer', layout: 'admin', description: 'Projects and resources' },
  ],

  roles: [
    { id: 'admin', name: 'Principal Engineer', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'engineer', name: 'Project Engineer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'designer', name: 'Design Engineer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/drawings' },
    { id: 'technician', name: 'CAD Technician', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/cad' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'documents',
    'dashboard',
    'time-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an engineering firm platform',
    'Create a consulting engineer management app',
    'I need an engineering project tracker',
    'Build a civil engineering practice system',
    'Create an engineering client portal',
  ],
};
