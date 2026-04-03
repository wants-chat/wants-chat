/**
 * Tile Installation App Type Definition
 *
 * Complete definition for tile installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TILE_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'tile-installation',
  name: 'Tile Installation',
  category: 'services',
  description: 'Tile Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tile installation",
      "tile",
      "installation",
      "tile software",
      "tile app",
      "tile platform",
      "tile system",
      "tile management",
      "services tile"
  ],

  synonyms: [
      "Tile Installation platform",
      "Tile Installation software",
      "Tile Installation system",
      "tile solution",
      "tile service"
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
      "Build a tile installation platform",
      "Create a tile installation app",
      "I need a tile installation management system",
      "Build a tile installation solution",
      "Create a tile installation booking system"
  ],
};
