/**
 * Fashion Boutique App Type Definition
 *
 * Complete definition for fashion boutique applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FASHION_BOUTIQUE_APP_TYPE: AppTypeDefinition = {
  id: 'fashion-boutique',
  name: 'Fashion Boutique',
  category: 'retail',
  description: 'Fashion Boutique platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "fashion boutique",
      "fashion",
      "boutique",
      "fashion software",
      "fashion app",
      "fashion platform",
      "fashion system",
      "fashion management",
      "retail fashion"
  ],

  synonyms: [
      "Fashion Boutique platform",
      "Fashion Boutique software",
      "Fashion Boutique system",
      "fashion solution",
      "fashion service"
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
      "Build a fashion boutique platform",
      "Create a fashion boutique app",
      "I need a fashion boutique management system",
      "Build a fashion boutique solution",
      "Create a fashion boutique booking system"
  ],
};
