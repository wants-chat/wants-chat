/**
 * Wading Pool App Type Definition
 *
 * Complete definition for wading pool applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WADING_POOL_APP_TYPE: AppTypeDefinition = {
  id: 'wading-pool',
  name: 'Wading Pool',
  category: 'services',
  description: 'Wading Pool platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wading pool",
      "wading",
      "pool",
      "wading software",
      "wading app",
      "wading platform",
      "wading system",
      "wading management",
      "services wading"
  ],

  synonyms: [
      "Wading Pool platform",
      "Wading Pool software",
      "Wading Pool system",
      "wading solution",
      "wading service"
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
      "Build a wading pool platform",
      "Create a wading pool app",
      "I need a wading pool management system",
      "Build a wading pool solution",
      "Create a wading pool booking system"
  ],
};
