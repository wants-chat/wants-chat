/**
 * Counseling Center App Type Definition
 *
 * Complete definition for counseling and therapy center operations.
 * Essential for counseling centers, therapy practices, and mental health clinics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COUNSELING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'counseling-center',
  name: 'Counseling Center',
  category: 'healthcare',
  description: 'Counseling center platform with appointment scheduling, client intake, session notes, and therapist management',
  icon: 'heart',

  keywords: [
    'counseling center',
    'therapy practice',
    'counseling center software',
    'mental health clinic',
    'psychotherapy',
    'counseling center management',
    'appointment scheduling',
    'counseling center practice',
    'counseling center scheduling',
    'client intake',
    'counseling center crm',
    'session notes',
    'counseling center business',
    'therapist management',
    'counseling center pos',
    'family therapy',
    'counseling center operations',
    'couples counseling',
    'counseling center platform',
    'group therapy',
  ],

  synonyms: [
    'counseling center platform',
    'counseling center software',
    'therapy practice software',
    'mental health clinic software',
    'psychotherapy software',
    'appointment scheduling software',
    'counseling center practice software',
    'client intake software',
    'session notes software',
    'therapist management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and resources' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Clinical Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'therapist', name: 'Therapist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'receptionist', name: 'Receptionist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'treatment-plans',
    'telemedicine',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'feedback',
    'reporting',
    'prescriptions',
    'insurance-billing',
    'referrals',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a counseling center platform',
    'Create a therapy practice portal',
    'I need a mental health clinic management system',
    'Build an appointment and intake platform',
    'Create a therapist and client management app',
  ],
};
