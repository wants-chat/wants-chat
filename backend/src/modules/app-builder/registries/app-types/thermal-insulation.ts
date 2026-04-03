/**
 * Thermal Insulation App Type Definition
 *
 * Complete definition for thermal insulation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THERMAL_INSULATION_APP_TYPE: AppTypeDefinition = {
  id: 'thermal-insulation',
  name: 'Thermal Insulation',
  category: 'services',
  description: 'Thermal Insulation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "thermal insulation",
      "thermal",
      "insulation",
      "thermal software",
      "thermal app",
      "thermal platform",
      "thermal system",
      "thermal management",
      "services thermal"
  ],

  synonyms: [
      "Thermal Insulation platform",
      "Thermal Insulation software",
      "Thermal Insulation system",
      "thermal solution",
      "thermal service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a thermal insulation platform",
      "Create a thermal insulation app",
      "I need a thermal insulation management system",
      "Build a thermal insulation solution",
      "Create a thermal insulation booking system"
  ],
};
