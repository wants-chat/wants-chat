/**
 * Stock Photography App Type Definition
 *
 * Complete definition for stock photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STOCK_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'stock-photography',
  name: 'Stock Photography',
  category: 'services',
  description: 'Stock Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stock photography",
      "stock",
      "photography",
      "stock software",
      "stock app",
      "stock platform",
      "stock system",
      "stock management",
      "services stock"
  ],

  synonyms: [
      "Stock Photography platform",
      "Stock Photography software",
      "Stock Photography system",
      "stock solution",
      "stock service"
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a stock photography platform",
      "Create a stock photography app",
      "I need a stock photography management system",
      "Build a stock photography solution",
      "Create a stock photography booking system"
  ],
};
