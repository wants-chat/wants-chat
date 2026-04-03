/**
 * Medical Equipment Rental App Type Definition
 *
 * Complete definition for durable medical equipment (DME) rental.
 * Essential for DME providers, home medical equipment, and healthcare rentals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICAL_EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'medical-equipment-rental',
  name: 'Medical Equipment Rental',
  category: 'rental',
  description: 'Medical equipment platform with insurance billing, delivery scheduling, compliance tracking, and patient management',
  icon: 'activity',

  keywords: [
    'medical equipment',
    'dme rental',
    'medical equipment software',
    'home medical',
    'healthcare equipment',
    'medical equipment management',
    'insurance billing',
    'medical equipment practice',
    'medical equipment scheduling',
    'delivery scheduling',
    'medical equipment crm',
    'mobility aids',
    'medical equipment business',
    'oxygen equipment',
    'medical equipment pos',
    'hospital beds',
    'medical equipment operations',
    'cpap bipap',
    'medical equipment platform',
    'patient care',
  ],

  synonyms: [
    'medical equipment platform',
    'medical equipment software',
    'dme rental software',
    'home medical software',
    'healthcare equipment software',
    'insurance billing software',
    'medical equipment practice software',
    'delivery scheduling software',
    'mobility aids software',
    'patient care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and orders' },
    { id: 'admin', name: 'DME Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and patients' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'technician', name: 'Delivery Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'prescriptions',
    'referrals',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'healthcare',

  examplePrompts: [
    'Build a medical equipment rental platform',
    'Create a DME provider portal',
    'I need a home medical equipment management system',
    'Build a healthcare rental platform',
    'Create a patient and insurance billing app',
  ],
};
