/**
 * Unlocking Service App Type Definition
 *
 * Complete definition for unlocking service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNLOCKING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'unlocking-service',
  name: 'Unlocking Service',
  category: 'services',
  description: 'Unlocking Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "unlocking service",
      "unlocking",
      "service",
      "unlocking software",
      "unlocking app",
      "unlocking platform",
      "unlocking system",
      "unlocking management",
      "services unlocking"
  ],

  synonyms: [
      "Unlocking Service platform",
      "Unlocking Service software",
      "Unlocking Service system",
      "unlocking solution",
      "unlocking service"
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
      "Build a unlocking service platform",
      "Create a unlocking service app",
      "I need a unlocking service management system",
      "Build a unlocking service solution",
      "Create a unlocking service booking system"
  ],
};
