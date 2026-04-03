/**
 * Web Marketing App Type Definition
 *
 * Complete definition for web marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEB_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'web-marketing',
  name: 'Web Marketing',
  category: 'retail',
  description: 'Web Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "web marketing",
      "web",
      "marketing",
      "web software",
      "web app",
      "web platform",
      "web system",
      "web management",
      "retail web"
  ],

  synonyms: [
      "Web Marketing platform",
      "Web Marketing software",
      "Web Marketing system",
      "web solution",
      "web service"
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
      "Build a web marketing platform",
      "Create a web marketing app",
      "I need a web marketing management system",
      "Build a web marketing solution",
      "Create a web marketing booking system"
  ],
};
