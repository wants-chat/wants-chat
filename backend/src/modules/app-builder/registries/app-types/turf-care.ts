/**
 * Turf Care App Type Definition
 *
 * Complete definition for turf care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURF_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'turf-care',
  name: 'Turf Care',
  category: 'healthcare',
  description: 'Turf Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "turf care",
      "turf",
      "care",
      "turf software",
      "turf app",
      "turf platform",
      "turf system",
      "turf management",
      "healthcare turf"
  ],

  synonyms: [
      "Turf Care platform",
      "Turf Care software",
      "Turf Care system",
      "turf solution",
      "turf service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Practice Owner",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "patient-records",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "telemedicine",
      "prescriptions",
      "insurance-billing",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a turf care platform",
      "Create a turf care app",
      "I need a turf care management system",
      "Build a turf care solution",
      "Create a turf care booking system"
  ],
};
