/**
 * Pediatric App Type Definition
 *
 * Complete definition for pediatric practice and children's healthcare applications.
 * Essential for pediatricians, children's clinics, and family practices.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEDIATRIC_APP_TYPE: AppTypeDefinition = {
  id: 'pediatric',
  name: 'Pediatric',
  category: 'healthcare',
  description: 'Pediatric practice platform with appointment scheduling, vaccination tracking, growth charts, and family portals',
  icon: 'baby',

  keywords: [
    'pediatric',
    'pediatrician',
    'childrens doctor',
    'kids doctor',
    'pediatric clinic',
    'child healthcare',
    'baby doctor',
    'well child visit',
    'vaccination schedule',
    'immunizations',
    'growth tracking',
    'developmental milestones',
    'sick visit',
    'newborn care',
    'adolescent medicine',
    'pediatric urgent care',
    'child wellness',
    'infant care',
    'toddler health',
    'teen health',
    'school physicals',
  ],

  synonyms: [
    'pediatric platform',
    'pediatric software',
    'pediatrician software',
    'childrens clinic software',
    'pediatric practice software',
    'child healthcare app',
    'pediatric scheduling',
    'kids doctor app',
    'pediatric patient portal',
    'childrens health software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book appointments and track child health' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'pediatrician', layout: 'admin', description: 'Patient care and family management' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pediatrician', name: 'Pediatrician', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'np', name: 'Nurse Practitioner', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'nurse', name: 'Pediatric Nurse', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vaccinations' },
    { id: 'ma', name: 'Medical Assistant', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vitals' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'parent', name: 'Parent/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'calendar',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pediatric practice platform',
    'Create a childrens doctor booking app',
    'I need a pediatric patient portal with vaccination tracking',
    'Build a pediatrician scheduling system',
    'Create a kids health clinic app',
  ],
};
