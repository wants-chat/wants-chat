/**
 * Solar Lighting App Type Definition
 *
 * Complete definition for solar lighting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_LIGHTING_APP_TYPE: AppTypeDefinition = {
  id: 'solar-lighting',
  name: 'Solar Lighting',
  category: 'services',
  description: 'Solar Lighting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "solar lighting",
      "solar",
      "lighting",
      "solar software",
      "solar app",
      "solar platform",
      "solar system",
      "solar management",
      "services solar"
  ],

  synonyms: [
      "Solar Lighting platform",
      "Solar Lighting software",
      "Solar Lighting system",
      "solar solution",
      "solar service"
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
      "Build a solar lighting platform",
      "Create a solar lighting app",
      "I need a solar lighting management system",
      "Build a solar lighting solution",
      "Create a solar lighting booking system"
  ],
};
