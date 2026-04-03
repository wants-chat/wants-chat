/**
 * Workshop App Type Definition
 *
 * Complete definition for workshop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKSHOP_APP_TYPE: AppTypeDefinition = {
  id: 'workshop',
  name: 'Workshop',
  category: 'retail',
  description: 'Workshop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "workshop",
      "workshop software",
      "workshop app",
      "workshop platform",
      "workshop system",
      "workshop management",
      "retail workshop"
  ],

  synonyms: [
      "Workshop platform",
      "Workshop software",
      "Workshop system",
      "workshop solution",
      "workshop service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a workshop platform",
      "Create a workshop app",
      "I need a workshop management system",
      "Build a workshop solution",
      "Create a workshop booking system"
  ],
};
