/**
 * Trade Services App Type Definition
 *
 * Complete definition for trade services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'trade-services',
  name: 'Trade Services',
  category: 'services',
  description: 'Trade Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "trade services",
      "trade",
      "services",
      "trade software",
      "trade app",
      "trade platform",
      "trade system",
      "trade management",
      "services trade"
  ],

  synonyms: [
      "Trade Services platform",
      "Trade Services software",
      "Trade Services system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a trade services platform",
      "Create a trade services app",
      "I need a trade services management system",
      "Build a trade services solution",
      "Create a trade services booking system"
  ],
};
