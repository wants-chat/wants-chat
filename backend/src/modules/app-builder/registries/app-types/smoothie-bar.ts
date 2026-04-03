/**
 * Smoothie Bar App Type Definition
 *
 * Complete definition for smoothie bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMOOTHIE_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'smoothie-bar',
  name: 'Smoothie Bar',
  category: 'hospitality',
  description: 'Smoothie Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "smoothie bar",
      "smoothie",
      "bar",
      "smoothie software",
      "smoothie app",
      "smoothie platform",
      "smoothie system",
      "smoothie management",
      "food-beverage smoothie"
  ],

  synonyms: [
      "Smoothie Bar platform",
      "Smoothie Bar software",
      "Smoothie Bar system",
      "smoothie solution",
      "smoothie service"
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
      "Build a smoothie bar platform",
      "Create a smoothie bar app",
      "I need a smoothie bar management system",
      "Build a smoothie bar solution",
      "Create a smoothie bar booking system"
  ],
};
