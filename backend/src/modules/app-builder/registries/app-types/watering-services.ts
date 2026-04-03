/**
 * Watering Services App Type Definition
 *
 * Complete definition for watering services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'watering-services',
  name: 'Watering Services',
  category: 'services',
  description: 'Watering Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "watering services",
      "watering",
      "services",
      "watering software",
      "watering app",
      "watering platform",
      "watering system",
      "watering management",
      "services watering"
  ],

  synonyms: [
      "Watering Services platform",
      "Watering Services software",
      "Watering Services system",
      "watering solution",
      "watering service"
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
      "Build a watering services platform",
      "Create a watering services app",
      "I need a watering services management system",
      "Build a watering services solution",
      "Create a watering services booking system"
  ],
};
