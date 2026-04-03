/**
 * Hot Dog Cart App Type Definition
 *
 * Complete definition for hot dog cart applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOT_DOG_CART_APP_TYPE: AppTypeDefinition = {
  id: 'hot-dog-cart',
  name: 'Hot Dog Cart',
  category: 'automotive',
  description: 'Hot Dog Cart platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "hot dog cart",
      "hot",
      "dog",
      "cart",
      "hot software",
      "hot app",
      "hot platform",
      "hot system",
      "hot management",
      "automotive hot"
  ],

  synonyms: [
      "Hot Dog Cart platform",
      "Hot Dog Cart software",
      "Hot Dog Cart system",
      "hot solution",
      "hot service"
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
      "Build a hot dog cart platform",
      "Create a hot dog cart app",
      "I need a hot dog cart management system",
      "Build a hot dog cart solution",
      "Create a hot dog cart booking system"
  ],
};
