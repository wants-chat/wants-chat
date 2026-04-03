/**
 * Refugee Services App Type Definition
 *
 * Complete definition for refugee services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REFUGEE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'refugee-services',
  name: 'Refugee Services',
  category: 'services',
  description: 'Refugee Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "refugee services",
      "refugee",
      "services",
      "refugee software",
      "refugee app",
      "refugee platform",
      "refugee system",
      "refugee management",
      "services refugee"
  ],

  synonyms: [
      "Refugee Services platform",
      "Refugee Services software",
      "Refugee Services system",
      "refugee solution",
      "refugee service"
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
      "Build a refugee services platform",
      "Create a refugee services app",
      "I need a refugee services management system",
      "Build a refugee services solution",
      "Create a refugee services booking system"
  ],
};
