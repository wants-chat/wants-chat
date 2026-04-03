/**
 * Liquidation App Type Definition
 *
 * Complete definition for liquidation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIQUIDATION_APP_TYPE: AppTypeDefinition = {
  id: 'liquidation',
  name: 'Liquidation',
  category: 'services',
  description: 'Liquidation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "liquidation",
      "liquidation software",
      "liquidation app",
      "liquidation platform",
      "liquidation system",
      "liquidation management",
      "services liquidation"
  ],

  synonyms: [
      "Liquidation platform",
      "Liquidation software",
      "Liquidation system",
      "liquidation solution",
      "liquidation service"
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
      "Build a liquidation platform",
      "Create a liquidation app",
      "I need a liquidation management system",
      "Build a liquidation solution",
      "Create a liquidation booking system"
  ],
};
