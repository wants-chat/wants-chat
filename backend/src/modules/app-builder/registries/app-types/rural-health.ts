/**
 * Rural Health App Type Definition
 *
 * Complete definition for rural health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RURAL_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'rural-health',
  name: 'Rural Health',
  category: 'healthcare',
  description: 'Rural Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "rural health",
      "rural",
      "health",
      "rural software",
      "rural app",
      "rural platform",
      "rural system",
      "rural management",
      "healthcare rural"
  ],

  synonyms: [
      "Rural Health platform",
      "Rural Health software",
      "Rural Health system",
      "rural solution",
      "rural service"
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
      "Build a rural health platform",
      "Create a rural health app",
      "I need a rural health management system",
      "Build a rural health solution",
      "Create a rural health booking system"
  ],
};
