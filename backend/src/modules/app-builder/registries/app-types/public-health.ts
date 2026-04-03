/**
 * Public Health App Type Definition
 *
 * Complete definition for public health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'public-health',
  name: 'Public Health',
  category: 'healthcare',
  description: 'Public Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "public health",
      "public",
      "health",
      "public software",
      "public app",
      "public platform",
      "public system",
      "public management",
      "healthcare public"
  ],

  synonyms: [
      "Public Health platform",
      "Public Health software",
      "Public Health system",
      "public solution",
      "public service"
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
      "Build a public health platform",
      "Create a public health app",
      "I need a public health management system",
      "Build a public health solution",
      "Create a public health booking system"
  ],
};
