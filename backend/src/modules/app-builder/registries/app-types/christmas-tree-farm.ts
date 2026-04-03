/**
 * Christmas Tree Farm App Type Definition
 *
 * Complete definition for christmas tree farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHRISTMAS_TREE_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'christmas-tree-farm',
  name: 'Christmas Tree Farm',
  category: 'services',
  description: 'Christmas Tree Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "christmas tree farm",
      "christmas",
      "tree",
      "farm",
      "christmas software",
      "christmas app",
      "christmas platform",
      "christmas system",
      "christmas management",
      "services christmas"
  ],

  synonyms: [
      "Christmas Tree Farm platform",
      "Christmas Tree Farm software",
      "Christmas Tree Farm system",
      "christmas solution",
      "christmas service"
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
      "Build a christmas tree farm platform",
      "Create a christmas tree farm app",
      "I need a christmas tree farm management system",
      "Build a christmas tree farm solution",
      "Create a christmas tree farm booking system"
  ],
};
