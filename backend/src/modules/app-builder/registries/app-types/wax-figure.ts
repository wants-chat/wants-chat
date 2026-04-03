/**
 * Wax Figure App Type Definition
 *
 * Complete definition for wax figure applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAX_FIGURE_APP_TYPE: AppTypeDefinition = {
  id: 'wax-figure',
  name: 'Wax Figure',
  category: 'services',
  description: 'Wax Figure platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wax figure",
      "wax",
      "figure",
      "wax software",
      "wax app",
      "wax platform",
      "wax system",
      "wax management",
      "services wax"
  ],

  synonyms: [
      "Wax Figure platform",
      "Wax Figure software",
      "Wax Figure system",
      "wax solution",
      "wax service"
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
      "Build a wax figure platform",
      "Create a wax figure app",
      "I need a wax figure management system",
      "Build a wax figure solution",
      "Create a wax figure booking system"
  ],
};
