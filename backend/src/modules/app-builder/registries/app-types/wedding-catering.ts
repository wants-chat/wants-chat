/**
 * Wedding Catering App Type Definition
 *
 * Complete definition for wedding catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-catering',
  name: 'Wedding Catering',
  category: 'hospitality',
  description: 'Wedding Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "wedding catering",
      "wedding",
      "catering",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "food-beverage wedding"
  ],

  synonyms: [
      "Wedding Catering platform",
      "Wedding Catering software",
      "Wedding Catering system",
      "wedding solution",
      "wedding service"
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
      "Build a wedding catering platform",
      "Create a wedding catering app",
      "I need a wedding catering management system",
      "Build a wedding catering solution",
      "Create a wedding catering booking system"
  ],
};
