/**
 * Wound Care App Type Definition
 *
 * Complete definition for wound care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOUND_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'wound-care',
  name: 'Wound Care',
  category: 'healthcare',
  description: 'Wound Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "wound care",
      "wound",
      "care",
      "wound software",
      "wound app",
      "wound platform",
      "wound system",
      "wound management",
      "healthcare wound"
  ],

  synonyms: [
      "Wound Care platform",
      "Wound Care software",
      "Wound Care system",
      "wound solution",
      "wound service"
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
      "Build a wound care platform",
      "Create a wound care app",
      "I need a wound care management system",
      "Build a wound care solution",
      "Create a wound care booking system"
  ],
};
