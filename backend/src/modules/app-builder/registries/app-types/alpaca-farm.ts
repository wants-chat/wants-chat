/**
 * Alpaca Farm App Type Definition
 *
 * Complete definition for alpaca farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALPACA_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'alpaca-farm',
  name: 'Alpaca Farm',
  category: 'services',
  description: 'Alpaca Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "alpaca farm",
      "alpaca",
      "farm",
      "alpaca software",
      "alpaca app",
      "alpaca platform",
      "alpaca system",
      "alpaca management",
      "services alpaca"
  ],

  synonyms: [
      "Alpaca Farm platform",
      "Alpaca Farm software",
      "Alpaca Farm system",
      "alpaca solution",
      "alpaca service"
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
      "Build a alpaca farm platform",
      "Create a alpaca farm app",
      "I need a alpaca farm management system",
      "Build a alpaca farm solution",
      "Create a alpaca farm booking system"
  ],
};
