/**
 * Therapeutic Massage App Type Definition
 *
 * Complete definition for therapeutic massage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THERAPEUTIC_MASSAGE_APP_TYPE: AppTypeDefinition = {
  id: 'therapeutic-massage',
  name: 'Therapeutic Massage',
  category: 'beauty',
  description: 'Therapeutic Massage platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "therapeutic massage",
      "therapeutic",
      "massage",
      "therapeutic software",
      "therapeutic app",
      "therapeutic platform",
      "therapeutic system",
      "therapeutic management",
      "beauty therapeutic"
  ],

  synonyms: [
      "Therapeutic Massage platform",
      "Therapeutic Massage software",
      "Therapeutic Massage system",
      "therapeutic solution",
      "therapeutic service"
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
      "Build a therapeutic massage platform",
      "Create a therapeutic massage app",
      "I need a therapeutic massage management system",
      "Build a therapeutic massage solution",
      "Create a therapeutic massage booking system"
  ],
};
