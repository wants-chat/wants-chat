/**
 * Wet Cleaning App Type Definition
 *
 * Complete definition for wet cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WET_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'wet-cleaning',
  name: 'Wet Cleaning',
  category: 'services',
  description: 'Wet Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wet cleaning",
      "wet",
      "cleaning",
      "wet software",
      "wet app",
      "wet platform",
      "wet system",
      "wet management",
      "services wet"
  ],

  synonyms: [
      "Wet Cleaning platform",
      "Wet Cleaning software",
      "Wet Cleaning system",
      "wet solution",
      "wet service"
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
      "Build a wet cleaning platform",
      "Create a wet cleaning app",
      "I need a wet cleaning management system",
      "Build a wet cleaning solution",
      "Create a wet cleaning booking system"
  ],
};
