/**
 * Trading App Type Definition
 *
 * Complete definition for trading applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADING_APP_TYPE: AppTypeDefinition = {
  id: 'trading',
  name: 'Trading',
  category: 'services',
  description: 'Trading platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trading",
      "trading software",
      "trading app",
      "trading platform",
      "trading system",
      "trading management",
      "services trading"
  ],

  synonyms: [
      "Trading platform",
      "Trading software",
      "Trading system",
      "trading solution",
      "trading service"
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
      "Build a trading platform",
      "Create a trading app",
      "I need a trading management system",
      "Build a trading solution",
      "Create a trading booking system"
  ],
};
