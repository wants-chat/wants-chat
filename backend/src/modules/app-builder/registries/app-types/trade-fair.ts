/**
 * Trade Fair App Type Definition
 *
 * Complete definition for trade fair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_FAIR_APP_TYPE: AppTypeDefinition = {
  id: 'trade-fair',
  name: 'Trade Fair',
  category: 'services',
  description: 'Trade Fair platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trade fair",
      "trade",
      "fair",
      "trade software",
      "trade app",
      "trade platform",
      "trade system",
      "trade management",
      "services trade"
  ],

  synonyms: [
      "Trade Fair platform",
      "Trade Fair software",
      "Trade Fair system",
      "trade solution",
      "trade service"
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
      "Build a trade fair platform",
      "Create a trade fair app",
      "I need a trade fair management system",
      "Build a trade fair solution",
      "Create a trade fair booking system"
  ],
};
