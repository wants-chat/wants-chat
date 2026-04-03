/**
 * Tree Removal App Type Definition
 *
 * Complete definition for tree removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'tree-removal',
  name: 'Tree Removal',
  category: 'services',
  description: 'Tree Removal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tree removal",
      "tree",
      "removal",
      "tree software",
      "tree app",
      "tree platform",
      "tree system",
      "tree management",
      "services tree"
  ],

  synonyms: [
      "Tree Removal platform",
      "Tree Removal software",
      "Tree Removal system",
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
      "Build a tree removal platform",
      "Create a tree removal app",
      "I need a tree removal management system",
      "Build a tree removal solution",
      "Create a tree removal booking system"
  ],
};
