/**
 * Price Comparison App Type Definition
 *
 * Complete definition for price comparison applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRICE_COMPARISON_APP_TYPE: AppTypeDefinition = {
  id: 'price-comparison',
  name: 'Price Comparison',
  category: 'services',
  description: 'Price Comparison platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "price comparison",
      "price",
      "comparison",
      "price software",
      "price app",
      "price platform",
      "price system",
      "price management",
      "services price"
  ],

  synonyms: [
      "Price Comparison platform",
      "Price Comparison software",
      "Price Comparison system",
      "price solution",
      "price service"
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
      "Build a price comparison platform",
      "Create a price comparison app",
      "I need a price comparison management system",
      "Build a price comparison solution",
      "Create a price comparison booking system"
  ],
};
