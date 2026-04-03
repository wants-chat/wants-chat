/**
 * Furniture Moving App Type Definition
 *
 * Complete definition for furniture moving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-moving',
  name: 'Furniture Moving',
  category: 'logistics',
  description: 'Furniture Moving platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "furniture moving",
      "furniture",
      "moving",
      "furniture software",
      "furniture app",
      "furniture platform",
      "furniture system",
      "furniture management",
      "services furniture"
  ],

  synonyms: [
      "Furniture Moving platform",
      "Furniture Moving software",
      "Furniture Moving system",
      "furniture solution",
      "furniture service"
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
      "reservations",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a furniture moving platform",
      "Create a furniture moving app",
      "I need a furniture moving management system",
      "Build a furniture moving solution",
      "Create a furniture moving booking system"
  ],
};
