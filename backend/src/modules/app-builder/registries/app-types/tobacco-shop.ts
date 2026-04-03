/**
 * Tobacco Shop App Type Definition
 *
 * Complete definition for tobacco shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOBACCO_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tobacco-shop',
  name: 'Tobacco Shop',
  category: 'retail',
  description: 'Tobacco Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tobacco shop",
      "tobacco",
      "shop",
      "tobacco software",
      "tobacco app",
      "tobacco platform",
      "tobacco system",
      "tobacco management",
      "retail tobacco"
  ],

  synonyms: [
      "Tobacco Shop platform",
      "Tobacco Shop software",
      "Tobacco Shop system",
      "tobacco solution",
      "tobacco service"
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
      "Build a tobacco shop platform",
      "Create a tobacco shop app",
      "I need a tobacco shop management system",
      "Build a tobacco shop solution",
      "Create a tobacco shop booking system"
  ],
};
