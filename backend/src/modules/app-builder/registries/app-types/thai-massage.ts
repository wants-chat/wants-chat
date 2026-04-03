/**
 * Thai Massage App Type Definition
 *
 * Complete definition for thai massage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THAI_MASSAGE_APP_TYPE: AppTypeDefinition = {
  id: 'thai-massage',
  name: 'Thai Massage',
  category: 'beauty',
  description: 'Thai Massage platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "thai massage",
      "thai",
      "massage",
      "thai software",
      "thai app",
      "thai platform",
      "thai system",
      "thai management",
      "beauty thai"
  ],

  synonyms: [
      "Thai Massage platform",
      "Thai Massage software",
      "Thai Massage system",
      "thai solution",
      "thai service"
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
      "Build a thai massage platform",
      "Create a thai massage app",
      "I need a thai massage management system",
      "Build a thai massage solution",
      "Create a thai massage booking system"
  ],
};
