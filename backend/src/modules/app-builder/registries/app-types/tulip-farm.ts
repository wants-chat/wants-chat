/**
 * Tulip Farm App Type Definition
 *
 * Complete definition for tulip farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TULIP_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'tulip-farm',
  name: 'Tulip Farm',
  category: 'services',
  description: 'Tulip Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tulip farm",
      "tulip",
      "farm",
      "tulip software",
      "tulip app",
      "tulip platform",
      "tulip system",
      "tulip management",
      "services tulip"
  ],

  synonyms: [
      "Tulip Farm platform",
      "Tulip Farm software",
      "Tulip Farm system",
      "tulip solution",
      "tulip service"
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
      "Build a tulip farm platform",
      "Create a tulip farm app",
      "I need a tulip farm management system",
      "Build a tulip farm solution",
      "Create a tulip farm booking system"
  ],
};
