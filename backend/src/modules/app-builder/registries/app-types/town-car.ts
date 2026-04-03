/**
 * Town Car App Type Definition
 *
 * Complete definition for town car applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWN_CAR_APP_TYPE: AppTypeDefinition = {
  id: 'town-car',
  name: 'Town Car',
  category: 'automotive',
  description: 'Town Car platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "town car",
      "town",
      "car",
      "town software",
      "town app",
      "town platform",
      "town system",
      "town management",
      "automotive town"
  ],

  synonyms: [
      "Town Car platform",
      "Town Car software",
      "Town Car system",
      "town solution",
      "town service"
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
      "Build a town car platform",
      "Create a town car app",
      "I need a town car management system",
      "Build a town car solution",
      "Create a town car booking system"
  ],
};
