/**
 * Pet Care App Type Definition
 *
 * Complete definition for pet care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'pet-care',
  name: 'Pet Care',
  category: 'healthcare',
  description: 'Pet Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "pet care",
      "pet",
      "care",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "healthcare pet"
  ],

  synonyms: [
      "Pet Care platform",
      "Pet Care software",
      "Pet Care system",
      "pet solution",
      "pet service"
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
      "Build a pet care platform",
      "Create a pet care app",
      "I need a pet care management system",
      "Build a pet care solution",
      "Create a pet care booking system"
  ],
};
