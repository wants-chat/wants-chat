/**
 * Veterinary & Pet Care App Type Definition
 *
 * Complete definition for veterinary and pet care applications.
 * Essential for veterinary clinics, pet care services, and animal hospitals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary',
  name: 'Veterinary & Pet Care',
  category: 'healthcare',
  description: 'Veterinary practice management with appointments, pet records, prescriptions, and client portal',
  icon: 'paw',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'veterinary',
    'vet',
    'veterinarian',
    'pet care',
    'animal hospital',
    'animal clinic',
    'pet clinic',
    'vet clinic',
    'pet hospital',
    'pet management',
    'pet records',
    'pet health',
    'dog grooming',
    'pet grooming',
    'pet boarding',
    'kennel',
    'pet sitting',
    'dog walking',
    'pet services',
    'animal care',
    'vet appointment',
    'pet vaccination',
    'pet pharmacy',
    'pet portal',
    'rover',
    'wag',
  ],

  synonyms: [
    'vet software',
    'veterinary software',
    'pet care platform',
    'animal care platform',
    'vet practice management',
    'pet management system',
    'veterinary system',
    'pet service platform',
    'animal hospital software',
    'pet clinic software',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
    'human healthcare',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Pet Owner Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Pet owner portal for appointments and records',
    },
    {
      id: 'admin',
      name: 'Clinic Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Veterinary clinic management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Practice Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'vet',
      name: 'Veterinarian',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/appointments',
    },
    {
      id: 'staff',
      name: 'Clinic Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/appointments',
    },
    {
      id: 'owner',
      name: 'Pet Owner',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/my-pets',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'notifications',
    'search',
    'patient-records',
    'prescriptions',
    'immunizations',
  ],

  optionalFeatures: [
    'payments',
    'reminders',
    'invoicing',
    'reporting',
    'treatment-plans',
    'lab-results',
    'medical-imaging',
    'referrals',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'teal',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a veterinary practice management system',
    'Create a pet care booking app',
    'I need a vet clinic management platform',
    'Build a pet portal for my veterinary clinic',
    'Create a pet health records system',
    'I want to build a vet appointment app',
    'Make a veterinary app with telemedicine',
  ],
};
