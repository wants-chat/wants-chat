/**
 * Canvas Printing App Type Definition
 *
 * Complete definition for canvas printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CANVAS_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'canvas-printing',
  name: 'Canvas Printing',
  category: 'services',
  description: 'Canvas Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "canvas printing",
      "canvas",
      "printing",
      "canvas software",
      "canvas app",
      "canvas platform",
      "canvas system",
      "canvas management",
      "services canvas"
  ],

  synonyms: [
      "Canvas Printing platform",
      "Canvas Printing software",
      "Canvas Printing system",
      "canvas solution",
      "canvas service"
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
      "Build a canvas printing platform",
      "Create a canvas printing app",
      "I need a canvas printing management system",
      "Build a canvas printing solution",
      "Create a canvas printing booking system"
  ],
};
