/**
 * House Cleaning App Type Definition
 *
 * Complete definition for house cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOUSE_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'house-cleaning',
  name: 'House Cleaning',
  category: 'services',
  description: 'House Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "house cleaning",
      "house",
      "cleaning",
      "house software",
      "house app",
      "house platform",
      "house system",
      "house management",
      "services house"
  ],

  synonyms: [
      "House Cleaning platform",
      "House Cleaning software",
      "House Cleaning system",
      "house solution",
      "house service"
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
      "Build a house cleaning platform",
      "Create a house cleaning app",
      "I need a house cleaning management system",
      "Build a house cleaning solution",
      "Create a house cleaning booking system"
  ],
};
