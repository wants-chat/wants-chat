/**
 * Wall Covering App Type Definition
 *
 * Complete definition for wall covering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALL_COVERING_APP_TYPE: AppTypeDefinition = {
  id: 'wall-covering',
  name: 'Wall Covering',
  category: 'services',
  description: 'Wall Covering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wall covering",
      "wall",
      "covering",
      "wall software",
      "wall app",
      "wall platform",
      "wall system",
      "wall management",
      "services wall"
  ],

  synonyms: [
      "Wall Covering platform",
      "Wall Covering software",
      "Wall Covering system",
      "wall solution",
      "wall service"
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
      "Build a wall covering platform",
      "Create a wall covering app",
      "I need a wall covering management system",
      "Build a wall covering solution",
      "Create a wall covering booking system"
  ],
};
