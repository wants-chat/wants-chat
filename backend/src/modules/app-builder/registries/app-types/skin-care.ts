/**
 * Skin Care App Type Definition
 *
 * Complete definition for skin care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKIN_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'skin-care',
  name: 'Skin Care',
  category: 'healthcare',
  description: 'Skin Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "skin care",
      "skin",
      "care",
      "skin software",
      "skin app",
      "skin platform",
      "skin system",
      "skin management",
      "healthcare skin"
  ],

  synonyms: [
      "Skin Care platform",
      "Skin Care software",
      "Skin Care system",
      "skin solution",
      "skin service"
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
      "Build a skin care platform",
      "Create a skin care app",
      "I need a skin care management system",
      "Build a skin care solution",
      "Create a skin care booking system"
  ],
};
