/**
 * Area Rug Cleaning App Type Definition
 *
 * Complete definition for area rug cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AREA_RUG_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'area-rug-cleaning',
  name: 'Area Rug Cleaning',
  category: 'services',
  description: 'Area Rug Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "area rug cleaning",
      "area",
      "rug",
      "cleaning",
      "area software",
      "area app",
      "area platform",
      "area system",
      "area management",
      "services area"
  ],

  synonyms: [
      "Area Rug Cleaning platform",
      "Area Rug Cleaning software",
      "Area Rug Cleaning system",
      "area solution",
      "area service"
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
      "Build a area rug cleaning platform",
      "Create a area rug cleaning app",
      "I need a area rug cleaning management system",
      "Build a area rug cleaning solution",
      "Create a area rug cleaning booking system"
  ],
};
