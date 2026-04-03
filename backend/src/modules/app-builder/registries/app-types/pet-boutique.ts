/**
 * Pet Boutique App Type Definition
 *
 * Complete definition for pet boutique applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_BOUTIQUE_APP_TYPE: AppTypeDefinition = {
  id: 'pet-boutique',
  name: 'Pet Boutique',
  category: 'retail',
  description: 'Pet Boutique platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "pet boutique",
      "pet",
      "boutique",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "retail pet"
  ],

  synonyms: [
      "Pet Boutique platform",
      "Pet Boutique software",
      "Pet Boutique system",
      "pet solution",
      "pet service"
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
      "Build a pet boutique platform",
      "Create a pet boutique app",
      "I need a pet boutique management system",
      "Build a pet boutique solution",
      "Create a pet boutique booking system"
  ],
};
