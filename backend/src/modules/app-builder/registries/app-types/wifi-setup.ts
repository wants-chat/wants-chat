/**
 * Wifi Setup App Type Definition
 *
 * Complete definition for wifi setup applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIFI_SETUP_APP_TYPE: AppTypeDefinition = {
  id: 'wifi-setup',
  name: 'Wifi Setup',
  category: 'services',
  description: 'Wifi Setup platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wifi setup",
      "wifi",
      "setup",
      "wifi software",
      "wifi app",
      "wifi platform",
      "wifi system",
      "wifi management",
      "services wifi"
  ],

  synonyms: [
      "Wifi Setup platform",
      "Wifi Setup software",
      "Wifi Setup system",
      "wifi solution",
      "wifi service"
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
      "Build a wifi setup platform",
      "Create a wifi setup app",
      "I need a wifi setup management system",
      "Build a wifi setup solution",
      "Create a wifi setup booking system"
  ],
};
