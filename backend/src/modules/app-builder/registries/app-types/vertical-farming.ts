/**
 * Vertical Farming App Type Definition
 *
 * Complete definition for vertical farming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VERTICAL_FARMING_APP_TYPE: AppTypeDefinition = {
  id: 'vertical-farming',
  name: 'Vertical Farming',
  category: 'services',
  description: 'Vertical Farming platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vertical farming",
      "vertical",
      "farming",
      "vertical software",
      "vertical app",
      "vertical platform",
      "vertical system",
      "vertical management",
      "services vertical"
  ],

  synonyms: [
      "Vertical Farming platform",
      "Vertical Farming software",
      "Vertical Farming system",
      "vertical solution",
      "vertical service"
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
      "Build a vertical farming platform",
      "Create a vertical farming app",
      "I need a vertical farming management system",
      "Build a vertical farming solution",
      "Create a vertical farming booking system"
  ],
};
