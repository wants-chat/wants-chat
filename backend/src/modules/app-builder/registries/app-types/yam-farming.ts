/**
 * Yam Farming App Type Definition
 *
 * Complete definition for yam farming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YAM_FARMING_APP_TYPE: AppTypeDefinition = {
  id: 'yam-farming',
  name: 'Yam Farming',
  category: 'services',
  description: 'Yam Farming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yam farming",
      "yam",
      "farming",
      "yam software",
      "yam app",
      "yam platform",
      "yam system",
      "yam management",
      "services yam"
  ],

  synonyms: [
      "Yam Farming platform",
      "Yam Farming software",
      "Yam Farming system",
      "yam solution",
      "yam service"
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
      "Build a yam farming platform",
      "Create a yam farming app",
      "I need a yam farming management system",
      "Build a yam farming solution",
      "Create a yam farming booking system"
  ],
};
