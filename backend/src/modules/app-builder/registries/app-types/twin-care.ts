/**
 * Twin Care App Type Definition
 *
 * Complete definition for twin care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TWIN_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'twin-care',
  name: 'Twin Care',
  category: 'healthcare',
  description: 'Twin Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "twin care",
      "twin",
      "care",
      "twin software",
      "twin app",
      "twin platform",
      "twin system",
      "twin management",
      "healthcare twin"
  ],

  synonyms: [
      "Twin Care platform",
      "Twin Care software",
      "Twin Care system",
      "twin solution",
      "twin service"
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
      "Build a twin care platform",
      "Create a twin care app",
      "I need a twin care management system",
      "Build a twin care solution",
      "Create a twin care booking system"
  ],
};
