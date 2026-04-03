/**
 * Nail Care App Type Definition
 *
 * Complete definition for nail care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NAIL_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'nail-care',
  name: 'Nail Care',
  category: 'healthcare',
  description: 'Nail Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "nail care",
      "nail",
      "care",
      "nail software",
      "nail app",
      "nail platform",
      "nail system",
      "nail management",
      "healthcare nail"
  ],

  synonyms: [
      "Nail Care platform",
      "Nail Care software",
      "Nail Care system",
      "nail solution",
      "nail service"
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
      "Build a nail care platform",
      "Create a nail care app",
      "I need a nail care management system",
      "Build a nail care solution",
      "Create a nail care booking system"
  ],
};
