/**
 * Product Design App Type Definition
 *
 * Complete definition for product design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRODUCT_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'product-design',
  name: 'Product Design',
  category: 'services',
  description: 'Product Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "product design",
      "product",
      "design",
      "product software",
      "product app",
      "product platform",
      "product system",
      "product management",
      "services product"
  ],

  synonyms: [
      "Product Design platform",
      "Product Design software",
      "Product Design system",
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
      "Build a product design platform",
      "Create a product design app",
      "I need a product design management system",
      "Build a product design solution",
      "Create a product design booking system"
  ],
};
