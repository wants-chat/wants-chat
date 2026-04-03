/**
 * Airline Catering App Type Definition
 *
 * Complete definition for airline catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRLINE_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'airline-catering',
  name: 'Airline Catering',
  category: 'hospitality',
  description: 'Airline Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "airline catering",
      "airline",
      "catering",
      "airline software",
      "airline app",
      "airline platform",
      "airline system",
      "airline management",
      "food-beverage airline"
  ],

  synonyms: [
      "Airline Catering platform",
      "Airline Catering software",
      "Airline Catering system",
      "airline solution",
      "airline service"
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
      "Build a airline catering platform",
      "Create a airline catering app",
      "I need a airline catering management system",
      "Build a airline catering solution",
      "Create a airline catering booking system"
  ],
};
