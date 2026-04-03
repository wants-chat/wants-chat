/**
 * Angel Investing App Type Definition
 *
 * Complete definition for angel investing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANGEL_INVESTING_APP_TYPE: AppTypeDefinition = {
  id: 'angel-investing',
  name: 'Angel Investing',
  category: 'services',
  description: 'Angel Investing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "angel investing",
      "angel",
      "investing",
      "angel software",
      "angel app",
      "angel platform",
      "angel system",
      "angel management",
      "services angel"
  ],

  synonyms: [
      "Angel Investing platform",
      "Angel Investing software",
      "Angel Investing system",
      "angel solution",
      "angel service"
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
      "Build a angel investing platform",
      "Create a angel investing app",
      "I need a angel investing management system",
      "Build a angel investing solution",
      "Create a angel investing booking system"
  ],
};
