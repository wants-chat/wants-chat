/**
 * Tree Trimming App Type Definition
 *
 * Complete definition for tree trimming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_TRIMMING_APP_TYPE: AppTypeDefinition = {
  id: 'tree-trimming',
  name: 'Tree Trimming',
  category: 'services',
  description: 'Tree Trimming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tree trimming",
      "tree",
      "trimming",
      "tree software",
      "tree app",
      "tree platform",
      "tree system",
      "tree management",
      "services tree"
  ],

  synonyms: [
      "Tree Trimming platform",
      "Tree Trimming software",
      "Tree Trimming system",
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
      "Build a tree trimming platform",
      "Create a tree trimming app",
      "I need a tree trimming management system",
      "Build a tree trimming solution",
      "Create a tree trimming booking system"
  ],
};
