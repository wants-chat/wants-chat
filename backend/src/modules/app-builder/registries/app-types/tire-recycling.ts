/**
 * Tire Recycling App Type Definition
 *
 * Complete definition for tire recycling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIRE_RECYCLING_APP_TYPE: AppTypeDefinition = {
  id: 'tire-recycling',
  name: 'Tire Recycling',
  category: 'automotive',
  description: 'Tire Recycling platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "tire recycling",
      "tire",
      "recycling",
      "tire software",
      "tire app",
      "tire platform",
      "tire system",
      "tire management",
      "automotive tire"
  ],

  synonyms: [
      "Tire Recycling platform",
      "Tire Recycling software",
      "Tire Recycling system",
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
      "Build a tire recycling platform",
      "Create a tire recycling app",
      "I need a tire recycling management system",
      "Build a tire recycling solution",
      "Create a tire recycling booking system"
  ],
};
