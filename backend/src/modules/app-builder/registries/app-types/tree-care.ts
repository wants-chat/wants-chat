/**
 * Tree Care App Type Definition
 *
 * Complete definition for tree care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TREE_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'tree-care',
  name: 'Tree Care',
  category: 'healthcare',
  description: 'Tree Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "tree care",
      "tree",
      "care",
      "tree software",
      "tree app",
      "tree platform",
      "tree system",
      "tree management",
      "healthcare tree"
  ],

  synonyms: [
      "Tree Care platform",
      "Tree Care software",
      "Tree Care system",
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "patient-records",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "telemedicine",
      "prescriptions",
      "insurance-billing",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a tree care platform",
      "Create a tree care app",
      "I need a tree care management system",
      "Build a tree care solution",
      "Create a tree care booking system"
  ],
};
