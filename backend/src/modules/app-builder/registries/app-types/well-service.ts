/**
 * Well Service App Type Definition
 *
 * Complete definition for well service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELL_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'well-service',
  name: 'Well Service',
  category: 'services',
  description: 'Well Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "well service",
      "well",
      "service",
      "well software",
      "well app",
      "well platform",
      "well system",
      "well management",
      "services well"
  ],

  synonyms: [
      "Well Service platform",
      "Well Service software",
      "Well Service system",
      "well solution",
      "well service"
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
      "Build a well service platform",
      "Create a well service app",
      "I need a well service management system",
      "Build a well service solution",
      "Create a well service booking system"
  ],
};
