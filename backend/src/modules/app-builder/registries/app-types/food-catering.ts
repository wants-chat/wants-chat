/**
 * Food Catering App Type Definition
 *
 * Complete definition for food catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'food-catering',
  name: 'Food Catering',
  category: 'hospitality',
  description: 'Food Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "food catering",
      "food",
      "catering",
      "food software",
      "food app",
      "food platform",
      "food system",
      "food management",
      "food-beverage food"
  ],

  synonyms: [
      "Food Catering platform",
      "Food Catering software",
      "Food Catering system",
      "food solution",
      "food service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "orders",
      "menu-management",
      "calendar",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "contracts",
      "clients",
      "reporting",
      "gallery"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a food catering platform",
      "Create a food catering app",
      "I need a food catering management system",
      "Build a food catering solution",
      "Create a food catering booking system"
  ],
};
