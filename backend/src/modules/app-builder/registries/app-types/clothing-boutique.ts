/**
 * Clothing Boutique App Type Definition
 *
 * Complete definition for clothing boutique applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLOTHING_BOUTIQUE_APP_TYPE: AppTypeDefinition = {
  id: 'clothing-boutique',
  name: 'Clothing Boutique',
  category: 'retail',
  description: 'Clothing Boutique platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "clothing boutique",
      "clothing",
      "boutique",
      "clothing software",
      "clothing app",
      "clothing platform",
      "clothing system",
      "clothing management",
      "retail clothing"
  ],

  synonyms: [
      "Clothing Boutique platform",
      "Clothing Boutique software",
      "Clothing Boutique system",
      "clothing solution",
      "clothing service"
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
      "Build a clothing boutique platform",
      "Create a clothing boutique app",
      "I need a clothing boutique management system",
      "Build a clothing boutique solution",
      "Create a clothing boutique booking system"
  ],
};
