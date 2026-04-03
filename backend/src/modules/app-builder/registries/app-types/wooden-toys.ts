/**
 * Wooden Toys App Type Definition
 *
 * Complete definition for wooden toys applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOODEN_TOYS_APP_TYPE: AppTypeDefinition = {
  id: 'wooden-toys',
  name: 'Wooden Toys',
  category: 'services',
  description: 'Wooden Toys platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wooden toys",
      "wooden",
      "toys",
      "wooden software",
      "wooden app",
      "wooden platform",
      "wooden system",
      "wooden management",
      "services wooden"
  ],

  synonyms: [
      "Wooden Toys platform",
      "Wooden Toys software",
      "Wooden Toys system",
      "wooden solution",
      "wooden service"
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
      "Build a wooden toys platform",
      "Create a wooden toys app",
      "I need a wooden toys management system",
      "Build a wooden toys solution",
      "Create a wooden toys booking system"
  ],
};
