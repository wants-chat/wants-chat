/**
 * Wine Tasting App Type Definition
 *
 * Complete definition for wine tasting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_TASTING_APP_TYPE: AppTypeDefinition = {
  id: 'wine-tasting',
  name: 'Wine Tasting',
  category: 'services',
  description: 'Wine Tasting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wine tasting",
      "wine",
      "tasting",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "services wine"
  ],

  synonyms: [
      "Wine Tasting platform",
      "Wine Tasting software",
      "Wine Tasting system",
      "wine solution",
      "wine service"
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
      "Build a wine tasting platform",
      "Create a wine tasting app",
      "I need a wine tasting management system",
      "Build a wine tasting solution",
      "Create a wine tasting booking system"
  ],
};
