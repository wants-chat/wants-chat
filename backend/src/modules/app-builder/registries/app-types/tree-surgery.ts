/**
 * Tree Surgery App Type Definition
 *
 * Complete definition for tree surgery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_SURGERY_APP_TYPE: AppTypeDefinition = {
  id: 'tree-surgery',
  name: 'Tree Surgery',
  category: 'services',
  description: 'Tree Surgery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tree surgery",
      "tree",
      "surgery",
      "tree software",
      "tree app",
      "tree platform",
      "tree system",
      "tree management",
      "services tree"
  ],

  synonyms: [
      "Tree Surgery platform",
      "Tree Surgery software",
      "Tree Surgery system",
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
      "Build a tree surgery platform",
      "Create a tree surgery app",
      "I need a tree surgery management system",
      "Build a tree surgery solution",
      "Create a tree surgery booking system"
  ],
};
