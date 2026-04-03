/**
 * Mobile Oil Change App Type Definition
 *
 * Complete definition for mobile oil change applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_OIL_CHANGE_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-oil-change',
  name: 'Mobile Oil Change',
  category: 'services',
  description: 'Mobile Oil Change platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mobile oil change",
      "mobile",
      "oil",
      "change",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "services mobile"
  ],

  synonyms: [
      "Mobile Oil Change platform",
      "Mobile Oil Change software",
      "Mobile Oil Change system",
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
      "Build a mobile oil change platform",
      "Create a mobile oil change app",
      "I need a mobile oil change management system",
      "Build a mobile oil change solution",
      "Create a mobile oil change booking system"
  ],
};
