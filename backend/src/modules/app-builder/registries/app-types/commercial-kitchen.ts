/**
 * Commercial Kitchen App Type Definition
 *
 * Complete definition for commercial kitchen applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_KITCHEN_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-kitchen',
  name: 'Commercial Kitchen',
  category: 'hospitality',
  description: 'Commercial Kitchen platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "commercial kitchen",
      "commercial",
      "kitchen",
      "commercial software",
      "commercial app",
      "commercial platform",
      "commercial system",
      "commercial management",
      "food-beverage commercial"
  ],

  synonyms: [
      "Commercial Kitchen platform",
      "Commercial Kitchen software",
      "Commercial Kitchen system",
      "commercial solution",
      "commercial service"
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
      "Build a commercial kitchen platform",
      "Create a commercial kitchen app",
      "I need a commercial kitchen management system",
      "Build a commercial kitchen solution",
      "Create a commercial kitchen booking system"
  ],
};
