/**
 * Sharpening Service App Type Definition
 *
 * Complete definition for sharpening service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHARPENING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'sharpening-service',
  name: 'Sharpening Service',
  category: 'services',
  description: 'Sharpening Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "sharpening service",
      "sharpening",
      "service",
      "sharpening software",
      "sharpening app",
      "sharpening platform",
      "sharpening system",
      "sharpening management",
      "services sharpening"
  ],

  synonyms: [
      "Sharpening Service platform",
      "Sharpening Service software",
      "Sharpening Service system",
      "sharpening solution",
      "sharpening service"
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
      "Build a sharpening service platform",
      "Create a sharpening service app",
      "I need a sharpening service management system",
      "Build a sharpening service solution",
      "Create a sharpening service booking system"
  ],
};
