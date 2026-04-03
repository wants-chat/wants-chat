/**
 * Foot Care App Type Definition
 *
 * Complete definition for foot care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOT_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'foot-care',
  name: 'Foot Care',
  category: 'healthcare',
  description: 'Foot Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "foot care",
      "foot",
      "care",
      "foot software",
      "foot app",
      "foot platform",
      "foot system",
      "foot management",
      "healthcare foot"
  ],

  synonyms: [
      "Foot Care platform",
      "Foot Care software",
      "Foot Care system",
      "foot solution",
      "foot service"
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
      "Build a foot care platform",
      "Create a foot care app",
      "I need a foot care management system",
      "Build a foot care solution",
      "Create a foot care booking system"
  ],
};
