/**
 * Wolf Sanctuary App Type Definition
 *
 * Complete definition for wolf sanctuary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOLF_SANCTUARY_APP_TYPE: AppTypeDefinition = {
  id: 'wolf-sanctuary',
  name: 'Wolf Sanctuary',
  category: 'services',
  description: 'Wolf Sanctuary platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wolf sanctuary",
      "wolf",
      "sanctuary",
      "wolf software",
      "wolf app",
      "wolf platform",
      "wolf system",
      "wolf management",
      "services wolf"
  ],

  synonyms: [
      "Wolf Sanctuary platform",
      "Wolf Sanctuary software",
      "Wolf Sanctuary system",
      "wolf solution",
      "wolf service"
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
      "Build a wolf sanctuary platform",
      "Create a wolf sanctuary app",
      "I need a wolf sanctuary management system",
      "Build a wolf sanctuary solution",
      "Create a wolf sanctuary booking system"
  ],
};
