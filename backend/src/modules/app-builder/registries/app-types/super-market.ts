/**
 * Super Market App Type Definition
 *
 * Complete definition for super market applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUPER_MARKET_APP_TYPE: AppTypeDefinition = {
  id: 'super-market',
  name: 'Super Market',
  category: 'retail',
  description: 'Super Market platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "super market",
      "super",
      "market",
      "super software",
      "super app",
      "super platform",
      "super system",
      "super management",
      "retail super"
  ],

  synonyms: [
      "Super Market platform",
      "Super Market software",
      "Super Market system",
      "super solution",
      "super service"
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
      "Build a super market platform",
      "Create a super market app",
      "I need a super market management system",
      "Build a super market solution",
      "Create a super market booking system"
  ],
};
