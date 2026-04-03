/**
 * Marketing Services App Type Definition
 *
 * Complete definition for marketing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARKETING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'marketing-services',
  name: 'Marketing Services',
  category: 'retail',
  description: 'Marketing Services platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "marketing services",
      "marketing",
      "services",
      "marketing software",
      "marketing app",
      "marketing platform",
      "marketing system",
      "marketing management",
      "retail marketing"
  ],

  synonyms: [
      "Marketing Services platform",
      "Marketing Services software",
      "Marketing Services system",
      "marketing solution",
      "marketing service"
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
      "Build a marketing services platform",
      "Create a marketing services app",
      "I need a marketing services management system",
      "Build a marketing services solution",
      "Create a marketing services booking system"
  ],
};
