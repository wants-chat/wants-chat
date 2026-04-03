/**
 * Fresh Market App Type Definition
 *
 * Complete definition for fresh market applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FRESH_MARKET_APP_TYPE: AppTypeDefinition = {
  id: 'fresh-market',
  name: 'Fresh Market',
  category: 'retail',
  description: 'Fresh Market platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "fresh market",
      "fresh",
      "market",
      "fresh software",
      "fresh app",
      "fresh platform",
      "fresh system",
      "fresh management",
      "retail fresh"
  ],

  synonyms: [
      "Fresh Market platform",
      "Fresh Market software",
      "Fresh Market system",
      "fresh solution",
      "fresh service"
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
      "Build a fresh market platform",
      "Create a fresh market app",
      "I need a fresh market management system",
      "Build a fresh market solution",
      "Create a fresh market booking system"
  ],
};
