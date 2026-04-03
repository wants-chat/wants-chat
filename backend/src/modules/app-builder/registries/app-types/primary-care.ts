/**
 * Primary Care App Type Definition
 *
 * Complete definition for primary care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIMARY_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'primary-care',
  name: 'Primary Care',
  category: 'healthcare',
  description: 'Primary Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "primary care",
      "primary",
      "care",
      "primary software",
      "primary app",
      "primary platform",
      "primary system",
      "primary management",
      "healthcare primary"
  ],

  synonyms: [
      "Primary Care platform",
      "Primary Care software",
      "Primary Care system",
      "primary solution",
      "primary service"
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
      "Build a primary care platform",
      "Create a primary care app",
      "I need a primary care management system",
      "Build a primary care solution",
      "Create a primary care booking system"
  ],
};
