/**
 * Vanilla Farming App Type Definition
 *
 * Complete definition for vanilla farming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VANILLA_FARMING_APP_TYPE: AppTypeDefinition = {
  id: 'vanilla-farming',
  name: 'Vanilla Farming',
  category: 'services',
  description: 'Vanilla Farming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vanilla farming",
      "vanilla",
      "farming",
      "vanilla software",
      "vanilla app",
      "vanilla platform",
      "vanilla system",
      "vanilla management",
      "services vanilla"
  ],

  synonyms: [
      "Vanilla Farming platform",
      "Vanilla Farming software",
      "Vanilla Farming system",
      "vanilla solution",
      "vanilla service"
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
      "Build a vanilla farming platform",
      "Create a vanilla farming app",
      "I need a vanilla farming management system",
      "Build a vanilla farming solution",
      "Create a vanilla farming booking system"
  ],
};
