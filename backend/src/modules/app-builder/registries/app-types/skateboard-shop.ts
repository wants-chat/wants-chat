/**
 * Skateboard Shop App Type Definition
 *
 * Complete definition for skateboard shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKATEBOARD_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'skateboard-shop',
  name: 'Skateboard Shop',
  category: 'retail',
  description: 'Skateboard Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "skateboard shop",
      "skateboard",
      "shop",
      "skateboard software",
      "skateboard app",
      "skateboard platform",
      "skateboard system",
      "skateboard management",
      "retail skateboard"
  ],

  synonyms: [
      "Skateboard Shop platform",
      "Skateboard Shop software",
      "Skateboard Shop system",
      "skateboard solution",
      "skateboard service"
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
      "Build a skateboard shop platform",
      "Create a skateboard shop app",
      "I need a skateboard shop management system",
      "Build a skateboard shop solution",
      "Create a skateboard shop booking system"
  ],
};
