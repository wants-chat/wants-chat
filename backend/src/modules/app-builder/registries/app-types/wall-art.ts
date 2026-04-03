/**
 * Wall Art App Type Definition
 *
 * Complete definition for wall art applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALL_ART_APP_TYPE: AppTypeDefinition = {
  id: 'wall-art',
  name: 'Wall Art',
  category: 'services',
  description: 'Wall Art platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wall art",
      "wall",
      "art",
      "wall software",
      "wall app",
      "wall platform",
      "wall system",
      "wall management",
      "services wall"
  ],

  synonyms: [
      "Wall Art platform",
      "Wall Art software",
      "Wall Art system",
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
      "Build a wall art platform",
      "Create a wall art app",
      "I need a wall art management system",
      "Build a wall art solution",
      "Create a wall art booking system"
  ],
};
