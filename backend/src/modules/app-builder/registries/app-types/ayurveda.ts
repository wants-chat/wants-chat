/**
 * Ayurveda App Type Definition
 *
 * Complete definition for Ayurvedic practice and wellness center applications.
 * Essential for Ayurvedic practitioners, panchakarma centers, and holistic clinics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AYURVEDA_APP_TYPE: AppTypeDefinition = {
  id: 'ayurveda',
  name: 'Ayurveda',
  category: 'wellness',
  description: 'Ayurvedic practice platform with consultation booking, treatment programs, herbal dispensary, and client management',
  icon: 'leaf',

  keywords: [
    'ayurveda',
    'ayurvedic',
    'ayurveda software',
    'ayurvedic practice',
    'ayurveda booking',
    'panchakarma',
    'ayurvedic clinic',
    'ayurveda center',
    'ayurvedic consultation',
    'dosha assessment',
    'ayurvedic treatment',
    'ayurveda therapist',
    'ayurvedic medicine',
    'ayurveda programs',
    'ayurvedic practitioner',
    'ayurveda scheduling',
    'ayurvedic wellness',
    'ayurveda business',
    'vedic wellness',
    'ayurveda appointments',
  ],

  synonyms: [
    'ayurveda platform',
    'ayurveda software',
    'ayurvedic practice software',
    'ayurveda booking software',
    'panchakarma software',
    'ayurvedic clinic software',
    'ayurveda scheduling software',
    'ayurvedic consultation software',
    'ayurveda management software',
    'ayurvedic center software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'ayurveda course'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Consultations and programs' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'practitioner', layout: 'admin', description: 'Clients and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'practitioner', name: 'Ayurvedic Practitioner', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clients' },
    { id: 'therapist', name: 'Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/treatments' },
    { id: 'receptionist', name: 'Receptionist', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'feedback',
    'gallery',
    'inventory',
    'reminders',
    'documents',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build an Ayurvedic practice platform',
    'Create an Ayurveda booking app',
    'I need a panchakarma center system',
    'Build an Ayurvedic wellness app',
    'Create an Ayurveda consultation platform',
  ],
};
