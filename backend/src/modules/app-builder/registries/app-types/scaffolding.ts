/**
 * Scaffolding App Type Definition
 *
 * Complete definition for scaffolding rental and erection contractor applications.
 * Essential for scaffolding companies, access solutions, and construction support.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCAFFOLDING_APP_TYPE: AppTypeDefinition = {
  id: 'scaffolding',
  name: 'Scaffolding',
  category: 'construction',
  description: 'Scaffolding contractor platform with inventory management, job scheduling, safety compliance, and rental tracking',
  icon: 'grid-3x3',

  keywords: [
    'scaffolding contractor',
    'scaffolding company',
    'scaffold rental',
    'scaffold erection',
    'scaffolding software',
    'access solutions',
    'scaffolding inventory',
    'scaffolding scheduling',
    'scaffold safety',
    'scaffolding estimating',
    'temporary access',
    'scaffold inspection',
    'scaffolding equipment',
    'construction scaffolding',
    'industrial scaffolding',
    'scaffold design',
    'scaffolding hire',
    'scaffold installation',
    'scaffolding tracking',
    'scaffolding business',
  ],

  synonyms: [
    'scaffolding contractor platform',
    'scaffolding contractor software',
    'scaffold rental software',
    'scaffolding company software',
    'scaffold management software',
    'scaffolding inventory software',
    'access solutions software',
    'scaffold scheduling software',
    'scaffolding tracking software',
    'scaffold erection software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'scaffold biology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and rentals' },
    { id: 'admin', name: 'Scaffolding Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Jobs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'supervisor', name: 'Site Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'inspector', name: 'Safety Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'erector', name: 'Scaffold Erector', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'inventory',
    'invoicing',
    'notifications',
    'search',
    'equipment-tracking',
    'daily-logs',
    'site-safety',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'appointments',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a scaffolding contractor platform',
    'Create a scaffold rental management app',
    'I need a scaffolding inventory system',
    'Build a scaffold safety tracking app',
    'Create a scaffolding company app',
  ],
};
