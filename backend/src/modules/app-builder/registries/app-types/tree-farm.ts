/**
 * Tree Farm App Type Definition
 *
 * Complete definition for tree farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'tree-farm',
  name: 'Tree Farm',
  category: 'services',
  description: 'Tree Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tree farm",
      "tree",
      "farm",
      "tree software",
      "tree app",
      "tree platform",
      "tree system",
      "tree management",
      "services tree"
  ],

  synonyms: [
      "Tree Farm platform",
      "Tree Farm software",
      "Tree Farm system",
      "tree solution",
      "tree service"
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
      "Build a tree farm platform",
      "Create a tree farm app",
      "I need a tree farm management system",
      "Build a tree farm solution",
      "Create a tree farm booking system"
  ],
};
