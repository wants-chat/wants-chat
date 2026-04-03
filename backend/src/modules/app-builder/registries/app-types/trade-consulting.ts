/**
 * Trade Consulting App Type Definition
 *
 * Complete definition for trade consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'trade-consulting',
  name: 'Trade Consulting',
  category: 'professional-services',
  description: 'Trade Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "trade consulting",
      "trade",
      "consulting",
      "trade software",
      "trade app",
      "trade platform",
      "trade system",
      "trade management",
      "consulting trade"
  ],

  synonyms: [
      "Trade Consulting platform",
      "Trade Consulting software",
      "Trade Consulting system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a trade consulting platform",
      "Create a trade consulting app",
      "I need a trade consulting management system",
      "Build a trade consulting solution",
      "Create a trade consulting booking system"
  ],
};
