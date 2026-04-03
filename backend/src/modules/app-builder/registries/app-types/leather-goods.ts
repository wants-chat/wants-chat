/**
 * Leather Goods App Type Definition
 *
 * Complete definition for leather goods applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEATHER_GOODS_APP_TYPE: AppTypeDefinition = {
  id: 'leather-goods',
  name: 'Leather Goods',
  category: 'services',
  description: 'Leather Goods platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "leather goods",
      "leather",
      "goods",
      "leather software",
      "leather app",
      "leather platform",
      "leather system",
      "leather management",
      "services leather"
  ],

  synonyms: [
      "Leather Goods platform",
      "Leather Goods software",
      "Leather Goods system",
      "leather solution",
      "leather service"
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
      "Build a leather goods platform",
      "Create a leather goods app",
      "I need a leather goods management system",
      "Build a leather goods solution",
      "Create a leather goods booking system"
  ],
};
