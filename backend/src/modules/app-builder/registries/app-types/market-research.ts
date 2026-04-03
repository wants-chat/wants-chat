/**
 * Market Research App Type Definition
 *
 * Complete definition for market research applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARKET_RESEARCH_APP_TYPE: AppTypeDefinition = {
  id: 'market-research',
  name: 'Market Research',
  category: 'retail',
  description: 'Market Research platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "market research",
      "market",
      "research",
      "market software",
      "market app",
      "market platform",
      "market system",
      "market management",
      "retail market"
  ],

  synonyms: [
      "Market Research platform",
      "Market Research software",
      "Market Research system",
      "market solution",
      "market service"
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
      "Build a market research platform",
      "Create a market research app",
      "I need a market research management system",
      "Build a market research solution",
      "Create a market research booking system"
  ],
};
