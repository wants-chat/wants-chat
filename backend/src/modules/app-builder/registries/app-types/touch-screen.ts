/**
 * Touch Screen App Type Definition
 *
 * Complete definition for touch screen applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUCH_SCREEN_APP_TYPE: AppTypeDefinition = {
  id: 'touch-screen',
  name: 'Touch Screen',
  category: 'services',
  description: 'Touch Screen platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "touch screen",
      "touch",
      "screen",
      "touch software",
      "touch app",
      "touch platform",
      "touch system",
      "touch management",
      "services touch"
  ],

  synonyms: [
      "Touch Screen platform",
      "Touch Screen software",
      "Touch Screen system",
      "touch solution",
      "touch service"
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
      "Build a touch screen platform",
      "Create a touch screen app",
      "I need a touch screen management system",
      "Build a touch screen solution",
      "Create a touch screen booking system"
  ],
};
