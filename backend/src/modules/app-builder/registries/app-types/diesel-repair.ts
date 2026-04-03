/**
 * Diesel Repair App Type Definition
 *
 * Complete definition for diesel repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIESEL_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'diesel-repair',
  name: 'Diesel Repair',
  category: 'services',
  description: 'Diesel Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "diesel repair",
      "diesel",
      "repair",
      "diesel software",
      "diesel app",
      "diesel platform",
      "diesel system",
      "diesel management",
      "services diesel"
  ],

  synonyms: [
      "Diesel Repair platform",
      "Diesel Repair software",
      "Diesel Repair system",
      "diesel solution",
      "diesel service"
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
      "Build a diesel repair platform",
      "Create a diesel repair app",
      "I need a diesel repair management system",
      "Build a diesel repair solution",
      "Create a diesel repair booking system"
  ],
};
