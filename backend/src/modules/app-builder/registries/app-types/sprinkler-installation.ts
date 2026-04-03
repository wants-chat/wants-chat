/**
 * Sprinkler Installation App Type Definition
 *
 * Complete definition for sprinkler installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPRINKLER_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'sprinkler-installation',
  name: 'Sprinkler Installation',
  category: 'services',
  description: 'Sprinkler Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "sprinkler installation",
      "sprinkler",
      "installation",
      "sprinkler software",
      "sprinkler app",
      "sprinkler platform",
      "sprinkler system",
      "sprinkler management",
      "services sprinkler"
  ],

  synonyms: [
      "Sprinkler Installation platform",
      "Sprinkler Installation software",
      "Sprinkler Installation system",
      "sprinkler solution",
      "sprinkler service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a sprinkler installation platform",
      "Create a sprinkler installation app",
      "I need a sprinkler installation management system",
      "Build a sprinkler installation solution",
      "Create a sprinkler installation booking system"
  ],
};
