/**
 * Water Filtration App Type Definition
 *
 * Complete definition for water filtration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_FILTRATION_APP_TYPE: AppTypeDefinition = {
  id: 'water-filtration',
  name: 'Water Filtration',
  category: 'services',
  description: 'Water Filtration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "water filtration",
      "water",
      "filtration",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "services water"
  ],

  synonyms: [
      "Water Filtration platform",
      "Water Filtration software",
      "Water Filtration system",
      "water solution",
      "water service"
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
      "Build a water filtration platform",
      "Create a water filtration app",
      "I need a water filtration management system",
      "Build a water filtration solution",
      "Create a water filtration booking system"
  ],
};
