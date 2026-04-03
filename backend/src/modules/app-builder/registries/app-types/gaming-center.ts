/**
 * Gaming Center App Type Definition
 *
 * Complete definition for gaming center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GAMING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'gaming-center',
  name: 'Gaming Center',
  category: 'services',
  description: 'Gaming Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "gaming center",
      "gaming",
      "center",
      "gaming software",
      "gaming app",
      "gaming platform",
      "gaming system",
      "gaming management",
      "services gaming"
  ],

  synonyms: [
      "Gaming Center platform",
      "Gaming Center software",
      "Gaming Center system",
      "gaming solution",
      "gaming service"
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
      "Build a gaming center platform",
      "Create a gaming center app",
      "I need a gaming center management system",
      "Build a gaming center solution",
      "Create a gaming center booking system"
  ],
};
