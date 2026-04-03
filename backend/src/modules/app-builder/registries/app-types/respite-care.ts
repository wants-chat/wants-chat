/**
 * Respite Care App Type Definition
 *
 * Complete definition for respite care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESPITE_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'respite-care',
  name: 'Respite Care',
  category: 'healthcare',
  description: 'Respite Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "respite care",
      "respite",
      "care",
      "respite software",
      "respite app",
      "respite platform",
      "respite system",
      "respite management",
      "healthcare respite"
  ],

  synonyms: [
      "Respite Care platform",
      "Respite Care software",
      "Respite Care system",
      "respite solution",
      "respite service"
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
      "Build a respite care platform",
      "Create a respite care app",
      "I need a respite care management system",
      "Build a respite care solution",
      "Create a respite care booking system"
  ],
};
