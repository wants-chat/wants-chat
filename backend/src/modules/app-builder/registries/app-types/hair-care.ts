/**
 * Hair Care App Type Definition
 *
 * Complete definition for hair care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'hair-care',
  name: 'Hair Care',
  category: 'healthcare',
  description: 'Hair Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "hair care",
      "hair",
      "care",
      "hair software",
      "hair app",
      "hair platform",
      "hair system",
      "hair management",
      "healthcare hair"
  ],

  synonyms: [
      "Hair Care platform",
      "Hair Care software",
      "Hair Care system",
      "hair solution",
      "hair service"
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
      "Build a hair care platform",
      "Create a hair care app",
      "I need a hair care management system",
      "Build a hair care solution",
      "Create a hair care booking system"
  ],
};
