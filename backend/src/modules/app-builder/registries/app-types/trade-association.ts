/**
 * Trade Association App Type Definition
 *
 * Complete definition for trade association applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_ASSOCIATION_APP_TYPE: AppTypeDefinition = {
  id: 'trade-association',
  name: 'Trade Association',
  category: 'services',
  description: 'Trade Association platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trade association",
      "trade",
      "association",
      "trade software",
      "trade app",
      "trade platform",
      "trade system",
      "trade management",
      "services trade"
  ],

  synonyms: [
      "Trade Association platform",
      "Trade Association software",
      "Trade Association system",
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
      "Build a trade association platform",
      "Create a trade association app",
      "I need a trade association management system",
      "Build a trade association solution",
      "Create a trade association booking system"
  ],
};
