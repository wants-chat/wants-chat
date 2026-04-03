/**
 * Shuttle Service App Type Definition
 *
 * Complete definition for shuttle service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHUTTLE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'shuttle-service',
  name: 'Shuttle Service',
  category: 'services',
  description: 'Shuttle Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "shuttle service",
      "shuttle",
      "service",
      "shuttle software",
      "shuttle app",
      "shuttle platform",
      "shuttle system",
      "shuttle management",
      "services shuttle"
  ],

  synonyms: [
      "Shuttle Service platform",
      "Shuttle Service software",
      "Shuttle Service system",
      "shuttle solution",
      "shuttle service"
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
      "Build a shuttle service platform",
      "Create a shuttle service app",
      "I need a shuttle service management system",
      "Build a shuttle service solution",
      "Create a shuttle service booking system"
  ],
};
