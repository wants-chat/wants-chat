/**
 * Uniform Shop App Type Definition
 *
 * Complete definition for uniform shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIFORM_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'uniform-shop',
  name: 'Uniform Shop',
  category: 'retail',
  description: 'Uniform Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "uniform shop",
      "uniform",
      "shop",
      "uniform software",
      "uniform app",
      "uniform platform",
      "uniform system",
      "uniform management",
      "retail uniform"
  ],

  synonyms: [
      "Uniform Shop platform",
      "Uniform Shop software",
      "Uniform Shop system",
      "uniform solution",
      "uniform service"
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
      "Build a uniform shop platform",
      "Create a uniform shop app",
      "I need a uniform shop management system",
      "Build a uniform shop solution",
      "Create a uniform shop booking system"
  ],
};
