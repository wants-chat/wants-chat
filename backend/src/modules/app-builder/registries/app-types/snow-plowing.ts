/**
 * Snow Plowing App Type Definition
 *
 * Complete definition for snow plowing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SNOW_PLOWING_APP_TYPE: AppTypeDefinition = {
  id: 'snow-plowing',
  name: 'Snow Plowing',
  category: 'services',
  description: 'Snow Plowing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "snow plowing",
      "snow",
      "plowing",
      "snow software",
      "snow app",
      "snow platform",
      "snow system",
      "snow management",
      "services snow"
  ],

  synonyms: [
      "Snow Plowing platform",
      "Snow Plowing software",
      "Snow Plowing system",
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
      "Build a snow plowing platform",
      "Create a snow plowing app",
      "I need a snow plowing management system",
      "Build a snow plowing solution",
      "Create a snow plowing booking system"
  ],
};
