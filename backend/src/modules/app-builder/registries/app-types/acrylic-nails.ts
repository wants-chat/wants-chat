/**
 * Acrylic Nails App Type Definition
 *
 * Complete definition for acrylic nails applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACRYLIC_NAILS_APP_TYPE: AppTypeDefinition = {
  id: 'acrylic-nails',
  name: 'Acrylic Nails',
  category: 'beauty',
  description: 'Acrylic Nails platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "acrylic nails",
      "acrylic",
      "nails",
      "acrylic software",
      "acrylic app",
      "acrylic platform",
      "acrylic system",
      "acrylic management",
      "beauty acrylic"
  ],

  synonyms: [
      "Acrylic Nails platform",
      "Acrylic Nails software",
      "Acrylic Nails system",
      "acrylic solution",
      "acrylic service"
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
      "Build a acrylic nails platform",
      "Create a acrylic nails app",
      "I need a acrylic nails management system",
      "Build a acrylic nails solution",
      "Create a acrylic nails booking system"
  ],
};
