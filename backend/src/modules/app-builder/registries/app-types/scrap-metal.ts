/**
 * Scrap Metal App Type Definition
 *
 * Complete definition for scrap metal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCRAP_METAL_APP_TYPE: AppTypeDefinition = {
  id: 'scrap-metal',
  name: 'Scrap Metal',
  category: 'services',
  description: 'Scrap Metal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "scrap metal",
      "scrap",
      "metal",
      "scrap software",
      "scrap app",
      "scrap platform",
      "scrap system",
      "scrap management",
      "services scrap"
  ],

  synonyms: [
      "Scrap Metal platform",
      "Scrap Metal software",
      "Scrap Metal system",
      "scrap solution",
      "scrap service"
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
      "Build a scrap metal platform",
      "Create a scrap metal app",
      "I need a scrap metal management system",
      "Build a scrap metal solution",
      "Create a scrap metal booking system"
  ],
};
