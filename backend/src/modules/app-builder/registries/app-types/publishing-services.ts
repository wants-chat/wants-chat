/**
 * Publishing Services App Type Definition
 *
 * Complete definition for publishing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLISHING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'publishing-services',
  name: 'Publishing Services',
  category: 'hospitality',
  description: 'Publishing Services platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "publishing services",
      "publishing",
      "services",
      "publishing software",
      "publishing app",
      "publishing platform",
      "publishing system",
      "publishing management",
      "food-beverage publishing"
  ],

  synonyms: [
      "Publishing Services platform",
      "Publishing Services software",
      "Publishing Services system",
      "publishing solution",
      "publishing service"
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
      "Build a publishing services platform",
      "Create a publishing services app",
      "I need a publishing services management system",
      "Build a publishing services solution",
      "Create a publishing services booking system"
  ],
};
