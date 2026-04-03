/**
 * Cardiac Care App Type Definition
 *
 * Complete definition for cardiac care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CARDIAC_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'cardiac-care',
  name: 'Cardiac Care',
  category: 'healthcare',
  description: 'Cardiac Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "cardiac care",
      "cardiac",
      "care",
      "cardiac software",
      "cardiac app",
      "cardiac platform",
      "cardiac system",
      "cardiac management",
      "healthcare cardiac"
  ],

  synonyms: [
      "Cardiac Care platform",
      "Cardiac Care software",
      "Cardiac Care system",
      "cardiac solution",
      "cardiac service"
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
      "Build a cardiac care platform",
      "Create a cardiac care app",
      "I need a cardiac care management system",
      "Build a cardiac care solution",
      "Create a cardiac care booking system"
  ],
};
