/**
 * Water Heater App Type Definition
 *
 * Complete definition for water heater applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_HEATER_APP_TYPE: AppTypeDefinition = {
  id: 'water-heater',
  name: 'Water Heater',
  category: 'services',
  description: 'Water Heater platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "water heater",
      "water",
      "heater",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "services water"
  ],

  synonyms: [
      "Water Heater platform",
      "Water Heater software",
      "Water Heater system",
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
      "Build a water heater platform",
      "Create a water heater app",
      "I need a water heater management system",
      "Build a water heater solution",
      "Create a water heater booking system"
  ],
};
