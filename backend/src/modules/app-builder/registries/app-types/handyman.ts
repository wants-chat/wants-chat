/**
 * Home Repair & Handyman App Type Definition
 *
 * Complete definition for home repair and handyman service applications.
 * Essential for contractors, handymen, and home service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HANDYMAN_APP_TYPE: AppTypeDefinition = {
  id: 'handyman',
  name: 'Home Repair & Handyman',
  category: 'services',
  description: 'Home service platform with job booking, contractor management, and estimates',
  icon: 'hammer',

  keywords: [
    'handyman',
    'home repair',
    'home services',
    'contractor',
    'plumber',
    'electrician',
    'hvac',
    'home maintenance',
    'home improvement',
    'thumbtack',
    'angi',
    'homeadvisor',
    'taskrabbit',
    'porch',
    'repair service',
    'fix-it',
    'house repair',
    'general contractor',
    'carpentry',
    'painting',
    'roofing',
    'appliance repair',
    'installation',
    'maintenance',
  ],

  synonyms: [
    'home service platform',
    'handyman app',
    'contractor platform',
    'home repair app',
    'service marketplace',
    'tradesperson platform',
    'home maintenance app',
    'repair booking',
    'contractor booking',
    'service booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Service booking for homeowners' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin', description: 'Platform administration' },
    { id: 'vendor', name: 'Pro Dashboard', enabled: true, basePath: '/pro', requiredRole: 'contractor', layout: 'admin', description: 'Contractor job management' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'contractor', name: 'Contractor/Pro', level: 50, isDefault: false, accessibleSections: ['frontend', 'vendor'], defaultRoute: '/pro/jobs' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'messaging',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'scheduling',
    'gallery',
    'invoicing',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a handyman service platform',
    'Create a home repair booking app like Thumbtack',
    'I need a contractor marketplace',
    'Build a home services app with quotes',
    'Create a platform for finding local contractors',
  ],
};
