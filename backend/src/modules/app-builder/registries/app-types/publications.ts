/**
 * Publications App Type Definition
 *
 * Complete definition for publications applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLICATIONS_APP_TYPE: AppTypeDefinition = {
  id: 'publications',
  name: 'Publications',
  category: 'hospitality',
  description: 'Publications platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "publications",
      "publications software",
      "publications app",
      "publications platform",
      "publications system",
      "publications management",
      "food-beverage publications"
  ],

  synonyms: [
      "Publications platform",
      "Publications software",
      "Publications system",
      "publications solution",
      "publications service"
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
      "Build a publications platform",
      "Create a publications app",
      "I need a publications management system",
      "Build a publications solution",
      "Create a publications booking system"
  ],
};
