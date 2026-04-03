/**
 * Self Publishing App Type Definition
 *
 * Complete definition for self publishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SELF_PUBLISHING_APP_TYPE: AppTypeDefinition = {
  id: 'self-publishing',
  name: 'Self Publishing',
  category: 'hospitality',
  description: 'Self Publishing platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "self publishing",
      "self",
      "publishing",
      "self software",
      "self app",
      "self platform",
      "self system",
      "self management",
      "food-beverage self"
  ],

  synonyms: [
      "Self Publishing platform",
      "Self Publishing software",
      "Self Publishing system",
      "self solution",
      "self service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "table-reservations",
      "menu-management",
      "food-ordering",
      "pos-system",
      "notifications"
  ],

  optionalFeatures: [
      "kitchen-display",
      "payments",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a self publishing platform",
      "Create a self publishing app",
      "I need a self publishing management system",
      "Build a self publishing solution",
      "Create a self publishing booking system"
  ],
};
