/**
 * Wheel Chair App Type Definition
 *
 * Complete definition for wheel chair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHEEL_CHAIR_APP_TYPE: AppTypeDefinition = {
  id: 'wheel-chair',
  name: 'Wheel Chair',
  category: 'beauty',
  description: 'Wheel Chair platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "wheel chair",
      "wheel",
      "chair",
      "wheel software",
      "wheel app",
      "wheel platform",
      "wheel system",
      "wheel management",
      "beauty wheel"
  ],

  synonyms: [
      "Wheel Chair platform",
      "Wheel Chair software",
      "Wheel Chair system",
      "wheel solution",
      "wheel service"
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
      "scheduling",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a wheel chair platform",
      "Create a wheel chair app",
      "I need a wheel chair management system",
      "Build a wheel chair solution",
      "Create a wheel chair booking system"
  ],
};
