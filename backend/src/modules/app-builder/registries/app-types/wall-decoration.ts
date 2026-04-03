/**
 * Wall Decoration App Type Definition
 *
 * Complete definition for wall decoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALL_DECORATION_APP_TYPE: AppTypeDefinition = {
  id: 'wall-decoration',
  name: 'Wall Decoration',
  category: 'services',
  description: 'Wall Decoration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wall decoration",
      "wall",
      "decoration",
      "wall software",
      "wall app",
      "wall platform",
      "wall system",
      "wall management",
      "services wall"
  ],

  synonyms: [
      "Wall Decoration platform",
      "Wall Decoration software",
      "Wall Decoration system",
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
      "Build a wall decoration platform",
      "Create a wall decoration app",
      "I need a wall decoration management system",
      "Build a wall decoration solution",
      "Create a wall decoration booking system"
  ],
};
