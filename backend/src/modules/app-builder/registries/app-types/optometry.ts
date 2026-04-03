/**
 * Optometry App Type Definition
 *
 * Complete definition for optometry and eye care applications.
 * Essential for optometrists, ophthalmologists, and optical shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPTOMETRY_APP_TYPE: AppTypeDefinition = {
  id: 'optometry',
  name: 'Optometry',
  category: 'healthcare',
  description: 'Eye care platform with exam scheduling, prescription management, optical shop, and vision insurance billing',
  icon: 'eye',

  keywords: [
    'optometry',
    'optometrist',
    'eye doctor',
    'eye exam',
    'vision care',
    'optical shop',
    'eyeglasses',
    'contact lenses',
    'eye prescription',
    'ophthalmologist',
    'vision test',
    'eye health',
    'glasses fitting',
    'lens prescription',
    'eye care center',
    'vision center',
    'eyewear',
    'sunglasses',
    'progressive lenses',
    'bifocals',
    'lasik consultation',
  ],

  synonyms: [
    'optometry platform',
    'optometry software',
    'eye care software',
    'optical shop software',
    'eye doctor software',
    'vision care app',
    'optometrist scheduling',
    'optical store app',
    'eye exam booking',
    'eyewear management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book exams and shop eyewear' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'optometrist', layout: 'admin', description: 'Patient care and optical shop' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'optometrist', name: 'Optometrist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'optician', name: 'Optician', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/optical-shop' },
    { id: 'technician', name: 'Eye Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pre-testing' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'patient-records',
    'prescriptions',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'orders',
    'reminders',
    'reviews',
    'analytics',
    'treatment-plans',
    'referrals',
    'medical-imaging',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build an optometry practice platform',
    'Create an eye doctor booking app',
    'I need an optical shop with exam scheduling',
    'Build a vision care patient portal',
    'Create an eyewear store with appointments',
  ],
};
