/**
 * White Glove App Type Definition
 *
 * Complete definition for white glove applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHITE_GLOVE_APP_TYPE: AppTypeDefinition = {
  id: 'white-glove',
  name: 'White Glove',
  category: 'services',
  description: 'White Glove platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "white glove",
      "white",
      "glove",
      "white software",
      "white app",
      "white platform",
      "white system",
      "white management",
      "services white"
  ],

  synonyms: [
      "White Glove platform",
      "White Glove software",
      "White Glove system",
      "white solution",
      "white service"
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
      "Build a white glove platform",
      "Create a white glove app",
      "I need a white glove management system",
      "Build a white glove solution",
      "Create a white glove booking system"
  ],
};
