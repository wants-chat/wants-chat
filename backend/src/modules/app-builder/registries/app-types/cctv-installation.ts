/**
 * CCTV Installation App Type Definition
 *
 * Complete definition for CCTV installation company operations.
 * Essential for security camera installers, surveillance system integrators, and video security companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CCTV_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'cctv-installation',
  name: 'CCTV Installation',
  category: 'construction',
  description: 'CCTV installation platform with project management, system design, installation scheduling, and maintenance contracts',
  icon: 'video',

  keywords: [
    'cctv installation',
    'security cameras',
    'cctv installation software',
    'surveillance system',
    'video security',
    'cctv installation management',
    'project management',
    'cctv installation practice',
    'cctv installation scheduling',
    'system design',
    'cctv installation crm',
    'installation scheduling',
    'cctv installation business',
    'maintenance contracts',
    'cctv installation pos',
    'ip cameras',
    'cctv installation operations',
    'nvr dvr',
    'cctv installation platform',
    'access control',
  ],

  synonyms: [
    'cctv installation platform',
    'cctv installation software',
    'security cameras software',
    'surveillance system software',
    'video security software',
    'project management software',
    'cctv installation practice software',
    'system design software',
    'installation scheduling software',
    'ip cameras software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and service' },
    { id: 'admin', name: 'Installation Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Installation Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build a CCTV installation platform',
    'Create a security camera installer app',
    'I need a surveillance system integrator app',
    'Build a video security company app',
    'Create a CCTV installation portal',
  ],
};
