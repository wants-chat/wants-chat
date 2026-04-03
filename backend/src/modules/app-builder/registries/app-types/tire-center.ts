/**
 * Tire Center App Type Definition
 *
 * Complete definition for tire center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIRE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'tire-center',
  name: 'Tire Center',
  category: 'automotive',
  description: 'Tire Center platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "tire center",
      "tire",
      "center",
      "tire software",
      "tire app",
      "tire platform",
      "tire system",
      "tire management",
      "automotive tire"
  ],

  synonyms: [
      "Tire Center platform",
      "Tire Center software",
      "Tire Center system",
      "tire solution",
      "tire service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a tire center platform",
      "Create a tire center app",
      "I need a tire center management system",
      "Build a tire center solution",
      "Create a tire center booking system"
  ],
};
