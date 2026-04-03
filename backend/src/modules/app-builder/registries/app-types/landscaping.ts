/**
 * Landscaping & Lawn Care App Type Definition
 *
 * Complete definition for landscaping and lawn care service applications.
 * Essential for landscapers, lawn care companies, and garden maintenance providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LANDSCAPING_APP_TYPE: AppTypeDefinition = {
  id: 'landscaping',
  name: 'Landscaping & Lawn Care',
  category: 'services',
  description: 'Landscaping platform with service booking, route planning, crew management, and estimates',
  icon: 'leaf',

  keywords: [
    'landscaping',
    'lawn care',
    'lawn service',
    'lawn mowing',
    'garden maintenance',
    'yard work',
    'trugreen',
    'lawn doctor',
    'weed control',
    'fertilization',
    'hedge trimming',
    'tree service',
    'mulching',
    'leaf removal',
    'snow removal',
    'irrigation',
    'hardscaping',
    'landscape design',
    'sod installation',
    'outdoor living',
    'lawn treatment',
    'grounds maintenance',
  ],

  synonyms: [
    'landscaping platform',
    'lawn care software',
    'landscaping software',
    'lawn service app',
    'yard maintenance software',
    'lawn care app',
    'landscaping business app',
    'grounds maintenance software',
    'lawn mowing app',
    'landscaping management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and get quotes' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Crew and route management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'crew-lead', name: 'Crew Leader', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/route' },
    { id: 'crew', name: 'Crew Member', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'gallery',
    'reviews',
    'contracts',
    'invoicing',
    'analytics',
    'project-bids',
    'subcontractor-mgmt',
    'equipment-tracking',
    'change-orders',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a landscaping business platform',
    'Create a lawn care service booking app',
    'I need a lawn mowing scheduling software',
    'Build a landscaping company management system',
    'Create a lawn care app with route planning',
  ],
};
