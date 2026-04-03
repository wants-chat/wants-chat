/**
 * Vintage Car App Type Definition
 *
 * Complete definition for vintage car applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINTAGE_CAR_APP_TYPE: AppTypeDefinition = {
  id: 'vintage-car',
  name: 'Vintage Car',
  category: 'automotive',
  description: 'Vintage Car platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "vintage car",
      "vintage",
      "car",
      "vintage software",
      "vintage app",
      "vintage platform",
      "vintage system",
      "vintage management",
      "automotive vintage"
  ],

  synonyms: [
      "Vintage Car platform",
      "Vintage Car software",
      "Vintage Car system",
      "vintage solution",
      "vintage service"
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
      "Build a vintage car platform",
      "Create a vintage car app",
      "I need a vintage car management system",
      "Build a vintage car solution",
      "Create a vintage car booking system"
  ],
};
