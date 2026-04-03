/**
 * Testing Laboratory App Type Definition
 *
 * Complete definition for testing and quality lab operations.
 * Essential for QA labs, materials testing, and certification bodies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TESTING_LABORATORY_APP_TYPE: AppTypeDefinition = {
  id: 'testing-laboratory',
  name: 'Testing Laboratory',
  category: 'science-research',
  description: 'Testing laboratory platform with sample management, test scheduling, result reporting, and accreditation tracking',
  icon: 'beaker',

  keywords: [
    'testing laboratory',
    'qa lab',
    'testing laboratory software',
    'materials testing',
    'certification body',
    'testing laboratory management',
    'sample management',
    'testing laboratory practice',
    'testing laboratory scheduling',
    'test scheduling',
    'testing laboratory crm',
    'result reporting',
    'testing laboratory business',
    'accreditation tracking',
    'testing laboratory pos',
    'quality control',
    'testing laboratory operations',
    'calibration',
    'testing laboratory platform',
    'iso compliance',
  ],

  synonyms: [
    'testing laboratory platform',
    'testing laboratory software',
    'qa lab software',
    'materials testing software',
    'certification body software',
    'sample management software',
    'testing laboratory practice software',
    'test scheduling software',
    'result reporting software',
    'quality control software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Results and certificates' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Samples and tests' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Lab Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tests' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/samples' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'science-research',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a testing laboratory platform',
    'Create a QA lab portal',
    'I need a testing lab management system',
    'Build a sample tracking platform',
    'Create a result and certification app',
  ],
};
