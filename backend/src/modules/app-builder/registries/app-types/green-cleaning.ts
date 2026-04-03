/**
 * Green Cleaning App Type Definition
 *
 * Complete definition for green cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GREEN_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'green-cleaning',
  name: 'Green Cleaning',
  category: 'services',
  description: 'Green Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "green cleaning",
      "green",
      "cleaning",
      "green software",
      "green app",
      "green platform",
      "green system",
      "green management",
      "services green"
  ],

  synonyms: [
      "Green Cleaning platform",
      "Green Cleaning software",
      "Green Cleaning system",
      "green solution",
      "green service"
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
      "Build a green cleaning platform",
      "Create a green cleaning app",
      "I need a green cleaning management system",
      "Build a green cleaning solution",
      "Create a green cleaning booking system"
  ],
};
