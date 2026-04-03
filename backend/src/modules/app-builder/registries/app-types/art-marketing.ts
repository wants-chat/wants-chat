/**
 * Art Marketing App Type Definition
 *
 * Complete definition for art marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'art-marketing',
  name: 'Art Marketing',
  category: 'retail',
  description: 'Art Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "art marketing",
      "art",
      "marketing",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "retail art"
  ],

  synonyms: [
      "Art Marketing platform",
      "Art Marketing software",
      "Art Marketing system",
      "art solution",
      "art service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a art marketing platform",
      "Create a art marketing app",
      "I need a art marketing management system",
      "Build a art marketing solution",
      "Create a art marketing booking system"
  ],
};
