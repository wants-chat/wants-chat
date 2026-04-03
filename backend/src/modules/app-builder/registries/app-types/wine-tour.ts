/**
 * Wine Tour App Type Definition
 *
 * Complete definition for wine tour applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'wine-tour',
  name: 'Wine Tour',
  category: 'services',
  description: 'Wine Tour platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wine tour",
      "wine",
      "tour",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "services wine"
  ],

  synonyms: [
      "Wine Tour platform",
      "Wine Tour software",
      "Wine Tour system",
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
      "Build a wine tour platform",
      "Create a wine tour app",
      "I need a wine tour management system",
      "Build a wine tour solution",
      "Create a wine tour booking system"
  ],
};
