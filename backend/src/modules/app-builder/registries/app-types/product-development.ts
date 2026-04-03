/**
 * Product Development App Type Definition
 *
 * Complete definition for product development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRODUCT_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'product-development',
  name: 'Product Development',
  category: 'services',
  description: 'Product Development platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "product development",
      "product",
      "development",
      "product software",
      "product app",
      "product platform",
      "product system",
      "product management",
      "services product"
  ],

  synonyms: [
      "Product Development platform",
      "Product Development software",
      "Product Development system",
      "product solution",
      "product service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a product development platform",
      "Create a product development app",
      "I need a product development management system",
      "Build a product development solution",
      "Create a product development booking system"
  ],
};
