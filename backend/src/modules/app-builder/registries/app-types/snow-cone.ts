/**
 * Snow Cone App Type Definition
 *
 * Complete definition for snow cone applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SNOW_CONE_APP_TYPE: AppTypeDefinition = {
  id: 'snow-cone',
  name: 'Snow Cone',
  category: 'services',
  description: 'Snow Cone platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "snow cone",
      "snow",
      "cone",
      "snow software",
      "snow app",
      "snow platform",
      "snow system",
      "snow management",
      "services snow"
  ],

  synonyms: [
      "Snow Cone platform",
      "Snow Cone software",
      "Snow Cone system",
      "snow solution",
      "snow service"
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
      "Build a snow cone platform",
      "Create a snow cone app",
      "I need a snow cone management system",
      "Build a snow cone solution",
      "Create a snow cone booking system"
  ],
};
