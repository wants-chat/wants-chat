/**
 * Mobile Marketing App Type Definition
 *
 * Complete definition for mobile marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-marketing',
  name: 'Mobile Marketing',
  category: 'retail',
  description: 'Mobile Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "mobile marketing",
      "mobile",
      "marketing",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "retail mobile"
  ],

  synonyms: [
      "Mobile Marketing platform",
      "Mobile Marketing software",
      "Mobile Marketing system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile marketing platform",
      "Create a mobile marketing app",
      "I need a mobile marketing management system",
      "Build a mobile marketing solution",
      "Create a mobile marketing booking system"
  ],
};
