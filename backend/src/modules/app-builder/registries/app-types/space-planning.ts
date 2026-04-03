/**
 * Space Planning App Type Definition
 *
 * Complete definition for space planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPACE_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'space-planning',
  name: 'Space Planning',
  category: 'wellness',
  description: 'Space Planning platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "space planning",
      "space",
      "planning",
      "space software",
      "space app",
      "space platform",
      "space system",
      "space management",
      "wellness space"
  ],

  synonyms: [
      "Space Planning platform",
      "Space Planning software",
      "Space Planning system",
      "space solution",
      "space service"
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
      "pos-system",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "gallery",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a space planning platform",
      "Create a space planning app",
      "I need a space planning management system",
      "Build a space planning solution",
      "Create a space planning booking system"
  ],
};
