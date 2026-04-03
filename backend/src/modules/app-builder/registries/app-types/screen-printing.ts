/**
 * Screen Printing App Type Definition
 *
 * Complete definition for screen printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCREEN_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'screen-printing',
  name: 'Screen Printing',
  category: 'services',
  description: 'Screen Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "screen printing",
      "screen",
      "printing",
      "screen software",
      "screen app",
      "screen platform",
      "screen system",
      "screen management",
      "services screen"
  ],

  synonyms: [
      "Screen Printing platform",
      "Screen Printing software",
      "Screen Printing system",
      "screen solution",
      "screen service"
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
      "Build a screen printing platform",
      "Create a screen printing app",
      "I need a screen printing management system",
      "Build a screen printing solution",
      "Create a screen printing booking system"
  ],
};
