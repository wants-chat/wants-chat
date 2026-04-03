/**
 * Api Development App Type Definition
 *
 * Complete definition for api development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const API_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'api-development',
  name: 'Api Development',
  category: 'services',
  description: 'Api Development platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "api development",
      "api",
      "development",
      "api software",
      "api app",
      "api platform",
      "api system",
      "api management",
      "services api"
  ],

  synonyms: [
      "Api Development platform",
      "Api Development software",
      "Api Development system",
      "api solution",
      "api service"
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
      "Build a api development platform",
      "Create a api development app",
      "I need a api development management system",
      "Build a api development solution",
      "Create a api development booking system"
  ],
};
