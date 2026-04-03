/**
 * Wall Painting App Type Definition
 *
 * Complete definition for wall painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALL_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'wall-painting',
  name: 'Wall Painting',
  category: 'construction',
  description: 'Wall Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "wall painting",
      "wall",
      "painting",
      "wall software",
      "wall app",
      "wall platform",
      "wall system",
      "wall management",
      "construction wall"
  ],

  synonyms: [
      "Wall Painting platform",
      "Wall Painting software",
      "Wall Painting system",
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
      "projects",
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a wall painting platform",
      "Create a wall painting app",
      "I need a wall painting management system",
      "Build a wall painting solution",
      "Create a wall painting booking system"
  ],
};
