/**
 * Wilderness Camp App Type Definition
 *
 * Complete definition for wilderness camp applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDERNESS_CAMP_APP_TYPE: AppTypeDefinition = {
  id: 'wilderness-camp',
  name: 'Wilderness Camp',
  category: 'services',
  description: 'Wilderness Camp platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wilderness camp",
      "wilderness",
      "camp",
      "wilderness software",
      "wilderness app",
      "wilderness platform",
      "wilderness system",
      "wilderness management",
      "services wilderness"
  ],

  synonyms: [
      "Wilderness Camp platform",
      "Wilderness Camp software",
      "Wilderness Camp system",
      "wilderness solution",
      "wilderness service"
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
      "Build a wilderness camp platform",
      "Create a wilderness camp app",
      "I need a wilderness camp management system",
      "Build a wilderness camp solution",
      "Create a wilderness camp booking system"
  ],
};
