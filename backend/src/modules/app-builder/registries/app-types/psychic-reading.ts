/**
 * Psychic Reading App Type Definition
 *
 * Complete definition for psychic reading applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PSYCHIC_READING_APP_TYPE: AppTypeDefinition = {
  id: 'psychic-reading',
  name: 'Psychic Reading',
  category: 'healthcare',
  description: 'Psychic Reading platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "psychic reading",
      "psychic",
      "reading",
      "psychic software",
      "psychic app",
      "psychic platform",
      "psychic system",
      "psychic management",
      "healthcare psychic"
  ],

  synonyms: [
      "Psychic Reading platform",
      "Psychic Reading software",
      "Psychic Reading system",
      "psychic solution",
      "psychic service"
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
      "Build a psychic reading platform",
      "Create a psychic reading app",
      "I need a psychic reading management system",
      "Build a psychic reading solution",
      "Create a psychic reading booking system"
  ],
};
