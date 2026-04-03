/**
 * Pharmacy App Type Definition
 *
 * Complete definition for pharmacy and prescription management applications.
 * Essential for pharmacies, drugstores, and healthcare providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHARMACY_APP_TYPE: AppTypeDefinition = {
  id: 'pharmacy',
  name: 'Pharmacy & Prescriptions',
  category: 'healthcare',
  description: 'Pharmacy platform with prescription management, medication orders, and delivery',
  icon: 'prescription-bottle-medical',

  keywords: [
    'pharmacy',
    'prescription',
    'drugstore',
    'medication',
    'medicine',
    'rx',
    'pharmacy delivery',
    'prescription refill',
    'cvs',
    'walgreens',
    'capsule pharmacy',
    'alto pharmacy',
    'pill pack',
    'pharmacy management',
    'drug dispensing',
    'pharmacist',
    'otc',
    'over the counter',
    'prescription transfer',
    'medication reminder',
    'drug interaction',
    'pharmacy pos',
    'pharmacy software',
  ],

  synonyms: [
    'pharmacy platform',
    'pharmacy software',
    'drugstore app',
    'prescription app',
    'medication platform',
    'pharmacy system',
    'rx platform',
    'pharmacy management',
    'pharmacy app',
    'medicine delivery',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce general', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Patient prescription ordering' },
    { id: 'admin', name: 'Pharmacy Dashboard', enabled: true, basePath: '/admin', requiredRole: 'pharmacist', layout: 'admin', description: 'Pharmacy operations management' },
  ],

  roles: [
    { id: 'admin', name: 'Pharmacy Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pharmacist', name: 'Pharmacist', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/prescriptions' },
    { id: 'technician', name: 'Pharmacy Technician', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/prescriptions' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'notifications',
    'search',
    'prescriptions',
    'patient-records',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'insurance-billing',
    'immunizations',
    'referrals',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a pharmacy management system',
    'Create a prescription ordering app',
    'I need a pharmacy delivery platform',
    'Build an online pharmacy like Capsule',
    'Create a pharmacy app with refill reminders',
  ],
};
