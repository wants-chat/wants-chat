/**
 * Whiskey Bar App Type Definition
 *
 * Complete definition for whiskey bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHISKEY_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'whiskey-bar',
  name: 'Whiskey Bar',
  category: 'hospitality',
  description: 'Whiskey Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "whiskey bar",
      "whiskey",
      "bar",
      "whiskey software",
      "whiskey app",
      "whiskey platform",
      "whiskey system",
      "whiskey management",
      "food-beverage whiskey"
  ],

  synonyms: [
      "Whiskey Bar platform",
      "Whiskey Bar software",
      "Whiskey Bar system",
      "whiskey solution",
      "whiskey service"
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
      "Build a whiskey bar platform",
      "Create a whiskey bar app",
      "I need a whiskey bar management system",
      "Build a whiskey bar solution",
      "Create a whiskey bar booking system"
  ],
};
