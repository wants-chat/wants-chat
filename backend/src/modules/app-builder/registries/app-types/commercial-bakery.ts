/**
 * Commercial Bakery App Type Definition
 *
 * Complete definition for commercial bakery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-bakery',
  name: 'Commercial Bakery',
  category: 'hospitality',
  description: 'Commercial Bakery platform with comprehensive management features',
  icon: 'bread',

  keywords: [
      "commercial bakery",
      "commercial",
      "bakery",
      "commercial software",
      "commercial app",
      "commercial platform",
      "commercial system",
      "commercial management",
      "food-beverage commercial"
  ],

  synonyms: [
      "Commercial Bakery platform",
      "Commercial Bakery software",
      "Commercial Bakery system",
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
      "product-catalog",
      "orders",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "shipping"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'warm',

  examplePrompts: [
      "Build a commercial bakery platform",
      "Create a commercial bakery app",
      "I need a commercial bakery management system",
      "Build a commercial bakery solution",
      "Create a commercial bakery booking system"
  ],
};
