/**
 * Warranty Services App Type Definition
 *
 * Complete definition for warranty services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WARRANTY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'warranty-services',
  name: 'Warranty Services',
  category: 'services',
  description: 'Warranty Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "warranty services",
      "warranty",
      "services",
      "warranty software",
      "warranty app",
      "warranty platform",
      "warranty system",
      "warranty management",
      "services warranty"
  ],

  synonyms: [
      "Warranty Services platform",
      "Warranty Services software",
      "Warranty Services system",
      "warranty solution",
      "warranty service"
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
      "Build a warranty services platform",
      "Create a warranty services app",
      "I need a warranty services management system",
      "Build a warranty services solution",
      "Create a warranty services booking system"
  ],
};
