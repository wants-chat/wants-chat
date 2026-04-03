/**
 * Child Care App Type Definition
 *
 * Complete definition for child care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHILD_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'child-care',
  name: 'Child Care',
  category: 'healthcare',
  description: 'Child Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "child care",
      "child",
      "care",
      "child software",
      "child app",
      "child platform",
      "child system",
      "child management",
      "healthcare child"
  ],

  synonyms: [
      "Child Care platform",
      "Child Care software",
      "Child Care system",
      "child solution",
      "child service"
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
      "Build a child care platform",
      "Create a child care app",
      "I need a child care management system",
      "Build a child care solution",
      "Create a child care booking system"
  ],
};
