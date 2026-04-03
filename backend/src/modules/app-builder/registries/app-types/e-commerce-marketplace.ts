/**
 * E Commerce Marketplace App Type Definition
 *
 * Complete definition for e commerce marketplace applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const E_COMMERCE_MARKETPLACE_APP_TYPE: AppTypeDefinition = {
  id: 'e-commerce-marketplace',
  name: 'E Commerce Marketplace',
  category: 'retail',
  description: 'E Commerce Marketplace platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "e commerce marketplace",
      "commerce",
      "marketplace",
      "e software",
      "e app",
      "e platform",
      "e system",
      "e management",
      "retail e"
  ],

  synonyms: [
      "E Commerce Marketplace platform",
      "E Commerce Marketplace software",
      "E Commerce Marketplace system",
      "e solution",
      "e service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a e commerce marketplace platform",
      "Create a e commerce marketplace app",
      "I need a e commerce marketplace management system",
      "Build a e commerce marketplace solution",
      "Create a e commerce marketplace booking system"
  ],
};
