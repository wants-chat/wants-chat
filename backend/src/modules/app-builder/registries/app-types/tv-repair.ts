/**
 * Tv Repair App Type Definition
 *
 * Complete definition for tv repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TV_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'tv-repair',
  name: 'Tv Repair',
  category: 'services',
  description: 'Tv Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tv repair",
      "repair",
      "tv software",
      "tv app",
      "tv platform",
      "tv system",
      "tv management",
      "services tv"
  ],

  synonyms: [
      "Tv Repair platform",
      "Tv Repair software",
      "Tv Repair system",
      "tv solution",
      "tv service"
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
      "Build a tv repair platform",
      "Create a tv repair app",
      "I need a tv repair management system",
      "Build a tv repair solution",
      "Create a tv repair booking system"
  ],
};
