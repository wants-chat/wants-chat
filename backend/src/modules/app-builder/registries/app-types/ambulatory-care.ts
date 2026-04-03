/**
 * Ambulatory Care App Type Definition
 *
 * Complete definition for ambulatory care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMBULATORY_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'ambulatory-care',
  name: 'Ambulatory Care',
  category: 'healthcare',
  description: 'Ambulatory Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "ambulatory care",
      "ambulatory",
      "care",
      "ambulatory software",
      "ambulatory app",
      "ambulatory platform",
      "ambulatory system",
      "ambulatory management",
      "healthcare ambulatory"
  ],

  synonyms: [
      "Ambulatory Care platform",
      "Ambulatory Care software",
      "Ambulatory Care system",
      "ambulatory solution",
      "ambulatory service"
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
      "Build a ambulatory care platform",
      "Create a ambulatory care app",
      "I need a ambulatory care management system",
      "Build a ambulatory care solution",
      "Create a ambulatory care booking system"
  ],
};
