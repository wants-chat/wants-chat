/**
 * Surface Cleaning App Type Definition
 *
 * Complete definition for surface cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURFACE_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'surface-cleaning',
  name: 'Surface Cleaning',
  category: 'services',
  description: 'Surface Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "surface cleaning",
      "surface",
      "cleaning",
      "surface software",
      "surface app",
      "surface platform",
      "surface system",
      "surface management",
      "services surface"
  ],

  synonyms: [
      "Surface Cleaning platform",
      "Surface Cleaning software",
      "Surface Cleaning system",
      "surface solution",
      "surface service"
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
      "Build a surface cleaning platform",
      "Create a surface cleaning app",
      "I need a surface cleaning management system",
      "Build a surface cleaning solution",
      "Create a surface cleaning booking system"
  ],
};
